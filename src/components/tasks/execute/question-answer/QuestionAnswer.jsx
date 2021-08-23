import axios from 'axios'
import React, { useEffect, useReducer, useRef } from 'react'
import { Form } from 'react-bootstrap'

import { addErrorNotification } from '../../../notifications/notifications'
import { answersPartUrl } from '../AnswerContext'
import { isEquivalent } from '../../edit/TaskSaveManager'
import { questionPartUrl } from '../../edit/QuestionsList'
import { SOURCE_TEST_QUESTION, SOURCE_TEXT_QUESTION } from '../../edit/QuestionVariant'
import './QuestionAnswer.less'

// auto save
const SAVE_DELAY = 30 * 1000

// flux
const CONTENT = 'CONTENT'
const SELECT_ANSWER = 'SELECT_ANSWER'

const answerReducer = (state, action) => {
    switch (action.type) {
        case CONTENT:
            return { ...state, content: action.payload }
        case SELECT_ANSWER:
            if (state.isMultipleAnswer) {
                let index = state.selectedAnswerVariantsIds.find(answer => answer === action.payload)
                if (index != null) return { ...state, selectedAnswerVariantsIds: state.selectedAnswerVariantsIds.filter(x => x !== action.payload) }
                else return { ...state, selectedAnswerVariantsIds: [...state.selectedAnswerVariantsIds, action.payload] }
            } else {
                return { ...state, selectedAnswerVariantsIds: [action.payload] }
            }
        default:
            return state
    }
}

// init state
const initQuestionAnswer = initialQuestionAnswer => {
    let initialAnswer
    if (initialQuestionAnswer.questionAnswer)
        initialAnswer = {
            ...initialQuestionAnswer.questionAnswer,
            type: initialQuestionAnswer.questionVariant.type,
        }
    else
        initialAnswer = {
            type: initialQuestionAnswer.questionVariant.type,
            questionId: initialQuestionAnswer.id,
        }

    switch (initialQuestionAnswer.questionVariant.type) {
        case SOURCE_TEXT_QUESTION:
            return {
                ...initialAnswer,
                content: initialAnswer.content ?? '',
            }
        case SOURCE_TEST_QUESTION:
            return {
                ...initialAnswer,
                isMultipleAnswer: initialQuestionAnswer.questionVariant.isMultipleAnswer,
                selectedAnswerVariantsIds: initialAnswer.selectedAnswerVariantsIds ?? [],
            }
        default:
            return {}
    }
}

// request
const questionAnswerPartUrl = 'answer'

async function create(taskAnswerId, questionId, questionAnswe) {
    return axios.post(`/${answersPartUrl}/${taskAnswerId}/${questionPartUrl}/${questionId}/${questionAnswerPartUrl}`, questionAnswe)
}

async function update(taskAnswerId, questionId, questionAnswer) {
    return axios.put(`/${answersPartUrl}/${taskAnswerId}/${questionPartUrl}/${questionId}/${questionAnswerPartUrl}?r=s`, questionAnswer)
}

const QuestionAnswer = ({ index, taskQuestionAnswer, readOnly = false }) => {
    const isDetached = useRef(taskQuestionAnswer.questionAnswer == null)
    const [answer, dispatchAnswer] = useReducer(answerReducer, initQuestionAnswer(taskQuestionAnswer))
    const lastSaveAnswer = useRef(answer)
    const saveAnswerTimer = useRef(undefined)

    const setContent = content => dispatchAnswer({ type: CONTENT, payload: content })
    const selectAnswer = answerId => dispatchAnswer({ type: SELECT_ANSWER, payload: answerId })

    const getAnswerInput = questionVariant => {
        switch (questionVariant.type) {
            case SOURCE_TEXT_QUESTION:
                return (
                    <div>
                        <textarea
                            className='form-control text-answer-input'
                            placeholder='Ваш ответ'
                            value={answer.content}
                            onChange={e => setContent(e.target.value)}
                            readOnly={readOnly}
                        />
                    </div>
                )
            case SOURCE_TEST_QUESTION:
                return questionVariant.testAnswerVariants.map(answerVariant => {
                    return (
                        <div key={answerVariant.id} className='answer-variant'>
                            <Form.Check
                                custom
                                type={questionVariant.isMultipleAnswer ? 'checkbox' : 'radio'}
                                id={`answer-${questionVariant.id}-${answerVariant.id}`}
                                label={answerVariant.answer}
                                name={questionVariant.id}
                                onChange={() => selectAnswer(answerVariant.id)}
                                defaultChecked={
                                    answer.selectedAnswerVariantsIds != null && answer.selectedAnswerVariantsIds.find(x => x === answerVariant.id) != null
                                }
                                readOnly={readOnly}
                            />
                        </div>
                    )
                })

            default:
                return null
        }
    }

    const isSaveBlocked = useRef(false)
    const answerToSaveRefBecouseSomeKindOfShipIsGoingWithContext = useRef(answer)
    useEffect(() => {
        answerToSaveRefBecouseSomeKindOfShipIsGoingWithContext.current = answer

        if (!isSaveBlocked.current) {
            if (!isEquivalent(answer, lastSaveAnswer.current)) {
                isSaveBlocked.current = true
                clearTimeout(saveAnswerTimer.current)
                saveAnswerTimer.current = setTimeout(() => {
                    isSaveBlocked.current = false
                    saveQuestionAnswer()
                }, SAVE_DELAY)
            }
        }
    }, [answer])

    useEffect(() => {
        return () => {
            clearTimeout(saveAnswerTimer.current)
        }
    }, [])

    const saveQuestionAnswer = () => {
        let answer = answerToSaveRefBecouseSomeKindOfShipIsGoingWithContext.current;
        if (isEquivalent(answer, lastSaveAnswer.current)) {
            return
        }

        lastSaveAnswer.current = answer
        if (isDetached.current) {
            create(taskQuestionAnswer.taskAnswerId, taskQuestionAnswer.questionVariant.id, answer)
                .then(res => { isDetached.current = false; })
                .catch(error => addErrorNotification('Не удалось сохранить ответ на задание. \n' + error))
        } else {
            update(taskQuestionAnswer.taskAnswerId, taskQuestionAnswer.questionVariant.id, answer)
                .then(res => {})
                .catch(error => addErrorNotification('Не удалось сохранить ответ на задание. \n' + error))
        }
    }

    return (
        <div className='question-answer-card'>
            <div className='m-3'>
                <div className='d-flex flex-wrap justify-content-between text-secondary font-size-12'>
                    <span>{index + 1} вопрос</span>
                </div>
                <div className='formulation-block' dangerouslySetInnerHTML={{ __html: taskQuestionAnswer.questionVariant.formulation }}></div>

                {getAnswerInput(taskQuestionAnswer.questionVariant)}
            </div>
        </div>
    )
}

export default QuestionAnswer
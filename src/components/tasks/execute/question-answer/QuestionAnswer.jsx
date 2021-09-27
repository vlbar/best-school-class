import axios from 'axios'
import React, { useContext, useEffect, useReducer, useRef } from 'react'
import { Form } from 'react-bootstrap'

import { addErrorNotification } from '../../../notifications/notifications'
import { AnswerSaveContext, answersPartUrl } from '../TaskAnswerTry'
import { isEquivalent } from '../../edit/TaskSaveManager'
import { SOURCE_TEST_QUESTION, SOURCE_TEXT_QUESTION } from '../../edit/QuestionVariant'
import { useContextUpdateCyclesSlave } from '../../context-function/ContextFunction'
import './QuestionAnswer.less'

const questionPartUrl = 'questions'

// auto save
const SAVE_DELAY = 20 * 1000

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

// progress
const isQuestionAnswered = (questionAnswer) => {
    if(questionAnswer.type === SOURCE_TEXT_QUESTION) {
        return questionAnswer.content.trim().length > 0
    } else if(questionAnswer.type === SOURCE_TEST_QUESTION) {
        return questionAnswer.selectedAnswerVariantsIds.length > 0
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

const QuestionAnswer = ({ index, taskQuestionAnswer, setQuestionAnswer, progress, readOnly = false }) => {
    const isDetached = useRef(taskQuestionAnswer.questionAnswer == null)
    const [answer, dispatchAnswer] = useReducer(answerReducer, initQuestionAnswer(taskQuestionAnswer))
    const lastSaveAnswer = useRef(answer)
    const saveAnswerTimer = useRef(undefined)

    const setContent = content => dispatchAnswer({ type: CONTENT, payload: content })
    const selectAnswer = answerId => dispatchAnswer({ type: SELECT_ANSWER, payload: answerId })

    const { onTaskAnswerSave } = useContext(AnswerSaveContext)
    useContextUpdateCyclesSlave(AnswerSaveContext, forceSaveAnswers)

    // context saving
    const isForceSave = useRef(false)
    function forceSaveAnswers() {
        isForceSave.current = true
        clearTimeout(saveAnswerTimer.current)
        saveQuestionAnswer()
    }

    const setIsSuccessSaved = (isSuccess) => {
        if(onTaskAnswerSave && isForceSave.current) {
            onTaskAnswerSave(isSuccess)
        }
    }

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
                            disabled={readOnly}
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
                                disabled={readOnly}
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
        updateProgress(answer)
        setQuestionAnswer(answer)

        if (!isSaveBlocked.current && !readOnly) {
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
        let answer = answerToSaveRefBecouseSomeKindOfShipIsGoingWithContext.current
        if (isEquivalent(answer, lastSaveAnswer.current)) {
            setIsSuccessSaved(true)
            return
        }

        if (isDetached.current) {
            create(taskQuestionAnswer.taskAnswerId, taskQuestionAnswer.questionVariant.id, answer)
                .then(res => { 
                    lastSaveAnswer.current = answer
                    isDetached.current = false
                    setIsSuccessSaved(true) 
                })
                .catch(error => {
                    addErrorNotification('Не удалось сохранить ответ на задание. \n' + error)
                    setIsSuccessSaved(false)
                })
        } else {
            update(taskQuestionAnswer.taskAnswerId, taskQuestionAnswer.questionVariant.id, answer)
                .then(res => { 
                    lastSaveAnswer.current = answer
                    setIsSuccessSaved(true)
                })
                .catch(error => {
                    addErrorNotification('Не удалось сохранить ответ на задание. \n' + error)
                    setIsSuccessSaved(false)
                })
        }
    }

    const isAnswered = useRef(undefined)
    const updateProgress = (questionAnswer) => {
        let isCurentAnaswered = isQuestionAnswered(questionAnswer)
        if(isAnswered.current === undefined) {
            isAnswered.current = isCurentAnaswered
            if(isCurentAnaswered) progress.add()
        } else {
            if(isCurentAnaswered) {
                if(!isAnswered.current) progress.add()
            } else {
                if(isAnswered.current) progress.remove()
            }

            isAnswered.current = isCurentAnaswered
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
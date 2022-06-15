import React, { useContext, useState, useEffect, useRef, useReducer } from 'react'
import { Button, Form, Col, Row } from 'react-bootstrap'
import { sortableHandle } from 'react-sortable-hoc'

import FeedbackMessage from '../../feedback/FeedbackMessage'
import ProcessBar from '../../process-bar/ProcessBar'
import useBestValidation from './useBestValidation'
import { QuestionVariant } from './QuestionVariant'
import { QuestionsContext } from './QuestionsList'
import { createError } from '../../notifications/notifications'
import { useTaskSaveManager, isEquivalent, SAVED_STATUS, ERROR_STATUS, VALIDATE_ERROR_STATUS } from './TaskSaveManager'
import './TaskQuestion.less'

//reducer
const MAX_SCORE = 'MAX_SCORE'
const IS_DETACHED = 'IS_DETACHED'
const ID = 'ID'

const questionReducer = (state, action) => {
    switch (action.type) {
        case MAX_SCORE:
            return { ...state, maxScore: action.payload }
        case IS_DETACHED:
            return { ...state, detached: action.payload }
        case ID:
            return { ...state, id: action.payload }
        default:
            return state
    }
}

//validation
const questionValidationSchema = {
    maxScore: {
        type: 'number',
        min: [1, 'Балл должен быть больше 0'],
        max: [9223372036854775807, 'Слишком большое количество баллов']
    }
}

//react-sortable-hoc
const DragHandle = sortableHandle(() => <button className='icon-btn' title='Переместить'><i className='fas fa-grip-lines fa-lg'></i></button>)

export const TaskQuestionContext = React.createContext()

export const TaskQuestion = ({ index, question, questionsLink }) => {
    let arrayIndex = index - 1
    const { questionToChange, setQuestionToChange, setQuestion, addQuestionAfter, moveQuestion, deleteQuestion } = useContext(QuestionsContext)
    const [isFetching, setIsFetching] = useState(false)
    const [isHover, setIsHover] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState(0)
    const [questionVariants, setQuestionVariants] = useState(undefined)
    const [variantsLink, setVariantsLink] = useState(question.link?.('variants'))
    const [selfLink, setSelfLink] = useState(question.link?.())

    const { callbackSubStatus, setIsChanged } = useTaskSaveManager(updateQuestion)
    const lastSavedData = useRef(question)

    const [taskQuestion, dispatchQuestion] = useReducer(questionReducer, question)
    const setId = (id) => dispatchQuestion({ type: ID, payload: id })
    const setIsDetached = (isDetached) => dispatchQuestion({ type: IS_DETACHED, payload: isDetached })
    const setMaxScore = (maxScore) => dispatchQuestion({ type: MAX_SCORE, payload: maxScore })

    const questionValidation = useBestValidation(questionValidationSchema)
    const [isValid, setIsValid] = useState(question.isValid !== undefined ? question.isValid : true)

    useEffect(() => {
        setIsValid((questionValidation.isValid) ? checkIsValid() : false)
    }, [questionValidation.isValid])

    function checkIsValid(targetVariants = questionVariants) {
        return !(!questionValidation.isValid || isVariantsHasInvalid(targetVariants))
    }

    useEffect(() => {
        setQuestion(taskQuestion, index)
        setIsChanged(!isEquivalent(taskQuestion, lastSavedData.current))
    }, [taskQuestion])

    useEffect(() => {
        if(question.questionVariants?.length > 0) {
            setQuestionVariants([...question.questionVariants])
        } else {
            setQuestionVariants([
                {
                    id: undefined,
                    formulation: '',
                    position: 1,
                    questionId: question.id,
                    numberOfSymbols: '',
                    type: 'TEXT_QUESTION'
                }
            ])
        }

        if(!question.detached) lastSavedData.current = {...question}
    }, [])

    function updateQuestion() {
        if(!questionValidation.validate(taskQuestion)) {
            callbackSubStatus(VALIDATE_ERROR_STATUS)
            return
        }

        if(!isDeleted && !question.detached && isEquivalent(question, lastSavedData.current)) { 
            callbackSubStatus(SAVED_STATUS)
            return
        }

        question.questionVariants = questionVariants

        if(question.detached) {
            let addableQuestion = {...question, id: null}
            questionsLink
                .post(addableQuestion)
                .then(data => {
                    setId(data.id)
                    setIsDetached(false)
                    setVariantsLink(data.link('variants'))
                    setSelfLink(data.link())

                    lastSavedData.current = taskQuestion
                    callbackSubStatus(SAVED_STATUS)
                })
                .catch(error => {
                    createError('Не удалось сохранить задание.', error)
                    callbackSubStatus(ERROR_STATUS)
                })
        } else {
            if(!isDeleted) {
                selfLink
                    .put(question)
                    .then(data => {
                        lastSavedData.current = {...question}
                        callbackSubStatus(SAVED_STATUS)
                    })
                    .catch(error => {
                        createError('Не удалось сохранить задание.', error)
                        callbackSubStatus(ERROR_STATUS)
                    })
            } else {
                selfLink
                    .remove()
                    .then(data => {
                        deleteQuestion(question)
                        callbackSubStatus(SAVED_STATUS)
                    })
                    .catch(error => {
                        createError('Не удалось удалить задание.', error)
                        callbackSubStatus(ERROR_STATUS)
                    })
            }
        }
    }

    const pushNewVariant = () => {
        let questionVariantsVar = questionVariants
        questionVariantsVar.push({
            id: undefined,
            formulation: '',
            position: questionVariantsVar.length,
            questionId: question.id,
            numberOfSymbols: '',
            type: 'TEXT_QUESTION'
        })

        setQuestionVariants([...questionVariantsVar])
        setSelectedVariant(questionVariantsVar.length - 1)
    }

    const onQuestionEdit = () => {
        setQuestionToChange(index)
    }

    const markForDeletion = () => {
        setIsDeleted(true)
        setIsChanged(true)
        if(question.detached) deleteQuestion(question)
    }

    const selectVartiant = async (index) => {
        setSelectedVariant(index)
    }

    const markForDeleteVariant = (index) => {
        if(questionVariants.filter(x => !x.markForDelete).length == 1) return
        let newIndex = index + 1

        const isVariantCanSelect = (index) => (questionVariants[index] && !questionVariants[index].markForDelete)

        while(newIndex < questionVariants.filter(x => !x.markForDelete).length && !isVariantCanSelect(newIndex))
            newIndex++

        if(!isVariantCanSelect(newIndex)) {
            newIndex = index - 1
            while(newIndex > 0 && !isVariantCanSelect(newIndex))
                newIndex--
        }

        selectVartiant(newIndex)

        let allVariants = questionVariants
        if(allVariants[index].id !== undefined)
            allVariants[index].markForDelete = true
        else deleteQuestionVariant(index)
        setQuestionVariants(allVariants)
    }

    const deleteQuestionVariant = (index) => {
        let cleanedVariants = questionVariants
        cleanedVariants.splice(index, 1)
        setQuestionVariants(cleanedVariants)
    }

    const setQuestionVariant = (variant, index) => {
        let targetVariants = questionVariants
        targetVariants[index] = variant

        if(variant.isValid) {
            if(!isValid) {
                setIsValid(checkIsValid(targetVariants))
            }
        } else {
            setIsValid(false)
        }

        setQuestionVariants(targetVariants)
    }

    const pasteVariantAfter = (variant, index) => {
        let targetVariants = questionVariants
        targetVariants[index] = variant
        setQuestionVariants([...targetVariants])
    }

    function isVariantsHasInvalid(targetVariants = questionVariants) {
        if(targetVariants) {
            let isHasInvalid = false // осуждаю
            targetVariants.forEach(variant => {
                if(variant.isValid !== undefined && !variant.isValid && !variant.markForDelete)
                    isHasInvalid = true
            })
            return isHasInvalid
        }
        return false
    }

    let variantCount = (questionVariants) ? questionVariants.filter(x => !x.markForDelete).length : 0
    let num = 1
    let isEditing = (questionToChange ? questionToChange === index : false)
    if(!isDeleted) return (
        <div className={!isValid ? 'invalid-question':''}>
            <div className={'question-card' + (isHover || isEditing ? ' hover':'') + (isEditing ? ' edit':'')} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                {(isFetching) && <ProcessBar height='.18Rem' className='position-absolute'/>}
                <div className='question-card-header'>
                    <div className='d-flex align-items-center'>
                        <DragHandle />
                        {(questionVariants) && questionVariants.map((variant, index) => {
                                if(!variant.markForDelete) 
                                    return <Button
                                        key={index}
                                        size='sm'
                                        variant={(variant.isValid == undefined || variant.isValid) ? selectedVariant == index ? 'primary' : 'outline-secondary' : 'outline-danger'}
                                        onClick={() => selectVartiant(index)}
                                        className={'question-variant-btn' + (selectedVariant !== index ? ' hover-border':'')}
                                    >
                                        {num++}
                                    </Button>
                            }
                        )}
                        {(questionVariants) && questionVariants.length < 10 && <Button
                            size='sm' 
                            variant='outline-secondary'
                            className='question-variant-btn hover-border on-card-hover'
                            onClick={() => pushNewVariant()}
                        >+</Button>}
                    </div>
                    <div className='d-flex align-items-center'>
                        <button className='icon-btn' title='Переместить ниже' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex + 1})}><i className='fas fa-angle-down fa-lg'/></button>
                        <button className='icon-btn mr-2' title='Переместить выше' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex - 1})}><i className='fas fa-angle-up fa-lg'/></button>
                        <button className='icon-btn' title='Удалить вопрос' onClick={() => markForDeletion()}><i className='fas fa-times fa-lg'/></button>
                    </div>
                </div>
                <div onClick={() => onQuestionEdit()}>
                    <TaskQuestionContext.Provider value={{ question, setQuestionVariant, pasteVariantAfter, variantCount, markForDeleteVariant, deleteQuestionVariant }}>
                        {(questionVariants) && questionVariants.map((variant, index) => {
                            if(!isEmpty(variant)) return (
                                <QuestionVariant key={index} show={selectedVariant == index} index={index} questionVariant={variant} isEditing={isEditing} variantsLink={variantsLink} />
                            )
                        })}
                    </TaskQuestionContext.Provider>
                    <hr className='question-card-hr'/>
                    <Row>
                        <Col>
                            <Form.Group className='flex-between mb-0' style ={{width: '155px', marginRight: '1.85Rem'}}>
                                <Form.Label className='label-sm-center mb-0 mr-3'>
                                    Балл.
                                </Form.Label>
                                <Form.Control
                                    type='number'
                                    min={1}
                                    size='sm'
                                    className='hover-border'
                                    name='maxScore'
                                    value={taskQuestion.maxScore}
                                    isInvalid={questionValidation.errors.maxScore}
                                    onBlur={questionValidation.blurHandle}
                                    onChange={(e) => {
                                        setMaxScore(Number(e.target.value))
                                        questionValidation.changeHandle(e)
                                    }}
                                />
                            </Form.Group>
                            <FeedbackMessage message={questionValidation.errors.maxScore}/>
                        </Col>
                    </Row>
                </div>
            </div>
            {isEditing &&
                <div className='question-card-actions'>
                    <Button 
                        variant={isValid ? 'primary' : 'outline-danger'}
                        onClick={() => addQuestionAfter(question.position + 1)}
                    >
                        Добавить вопрос
                    </Button>
                </div>
            }
        </div>
    )
    else return (<></>)
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
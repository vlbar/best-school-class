import React, { useContext, useState, useEffect, useRef, useReducer } from 'react'
import { Button, Form, Col, Row } from 'react-bootstrap'
import { sortableHandle } from 'react-sortable-hoc'
import { addErrorNotification } from '../../notifications/notifications'
import ProcessBar from '../../process-bar/ProcessBar'
import { useTaskSaveManager, isEquivalent, SAVED_STATUS, ERROR_STATUS, VALIDATE_ERROR_STATUS } from './TaskSaveManager'
import { QuestionsContext } from './QuestionsList'
import { QuestionVariant } from './QuestionVariant'
import { tasksBaseUrl } from './TaskEditor'
import { questionPartUrl } from './QuestionsList'
import { variantsPartUrl } from './QuestionVariant'
import useBestValidation from './useBestValidation'
import axios from 'axios'
import './TaskQuestion.less'
import FeedbackMessage from '../../feedback/FeedbackMessage'

//reducer
const MAX_SCORE = 'MAX_SCORE'

const questionReducer = (state, action) => {
    switch (action.type) {
        case MAX_SCORE:
            return { ...state, maxScore: action.payload }
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

//questions task requests
async function add(question, taskId) {
    return axios.post(`${tasksBaseUrl}/${taskId}/${questionPartUrl}`, question)
}

async function update(question, taskId) {
    return axios.put(`${tasksBaseUrl}/${taskId}/${questionPartUrl}/${question.id}`, question)
}

async function remove(question, taskId) {
    return axios.delete(`${tasksBaseUrl}/${taskId}/${questionPartUrl}/${question.id}`)
}

//question variant request
async function fetchQuestionVariants(question) {
    return axios.get(`/${questionPartUrl}/${question.id}/${variantsPartUrl}`)
}

//react-sortable-hoc
const DragHandle = sortableHandle(() => <button className='icon-btn' title='Переместить'><i className='fas fa-grip-lines fa-lg'></i></button>)

export const TaskQuestionContext = React.createContext()

export const TaskQuestion = ({index, question}) => {
    let arrayIndex = index - 1
    const { taskId, questionToChange, setQuestionToChange, setQuestion, addQuestionAfter, moveQuestion, deleteQuestion } = useContext(QuestionsContext)
    const [isFetching, setIsFetching] = useState(false)
    const [isHover, setIsHover] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState(0)
    const [questionVariants, setQuestionVariants] = useState(undefined)

    const { statusBySub, setIsChanged } = useTaskSaveManager(updateQuestion)
    const lastSavedData = useRef(question)

    const [taskQuestion, dispatchQuestion] = useReducer(questionReducer, question)
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
        question = taskQuestion

        setIsChanged(!isEquivalent(taskQuestion, lastSavedData.current))
    }, [taskQuestion])

    useEffect(() => {
        if(question.questionVariantsCount > 0) {
            let unloadedQuestions = new Array(question.questionVariantsCount).fill({})
            unloadedQuestions[0] = question.questionVariants[0]
            setQuestionVariants([...unloadedQuestions])
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
            statusBySub(VALIDATE_ERROR_STATUS)
            return
        }

        if(!isDeleted && isEquivalent(question, lastSavedData.current)) { 
            statusBySub(SAVED_STATUS)
            return
        }

        question.questionVariantsCount = questionVariants.length
        question.questionVariants = questionVariants

        if(question.detached) {
            let addableQuestion = {...question, id: null}
            add(addableQuestion, taskId)
                .then(res => {
                    let fetchedData = res.data
                    question.detached = false
                    question.id = fetchedData.id

                    lastSavedData.current = {...question}
                    statusBySub(SAVED_STATUS)
                })
                .catch(error => {
                    addErrorNotification('Не удалось сохранить задание. \n' + error)
                    statusBySub(ERROR_STATUS)
                    question.id = Math.random()
                })
        } else {
            if(!isDeleted) {
                update(question, taskId)
                    .then(res => {
                        lastSavedData.current = {...question}
                        statusBySub(SAVED_STATUS)
                    })
                    .catch(error => {
                        addErrorNotification('Не удалось сохранить задание. \n' + error)
                        statusBySub(ERROR_STATUS)
                        question.id = Math.random()
                    })
            } else {
                remove(question, taskId)
                    .then(res => {
                        deleteQuestion(question)
                        statusBySub(SAVED_STATUS)
                    })
                    .catch(error => {
                        addErrorNotification('Не удалось удалить задание. \n' + error)
                        statusBySub(ERROR_STATUS)
                    })
            }
        }
    }

    const pushNewVariant = () => {
        let questionVariantsVar = questionVariants
        questionVariantsVar.push({
            id: undefined,
            formulation: '',
            position: questionVariants[questionVariantsVar.length - 1].position + 1,
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
        if(question.detached) deleteQuestion(question)
    }

    
    const selectVartiant = async (index) => {
        if(isEmpty(questionVariants[index]))
            await fetchOtherVarinats()
        setSelectedVariant(index)
    }

    const fetchOtherVarinats = async () => {
        setIsFetching(true)
        await fetchQuestionVariants(question)
            .then(res => {
                let fetchedData = res.data 

                let allQuestionVariants = questionVariants
                let j = 1;
                for(let i = 0; i < allQuestionVariants.length; i++)
                    if(isEmpty(allQuestionVariants[i]))
                        allQuestionVariants[i] = fetchedData[j++]

                setQuestionVariants(allQuestionVariants)
            })
            .catch(error => {
                addErrorNotification('Не удалось загрузить варианты задания. \n' + error)
            })
            .finally(() => {
                setIsFetching(false)
            })
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
                if(variant.isValid !== undefined && !variant.isValid)
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
                <div className='m-3'>
                    <div className='question-card-header'>
                        <div>
                            <DragHandle />
                            {(questionVariants) && questionVariants.map((variant, index) => {
                                    if(!variant.markForDelete) 
                                        return <Button
                                            key={index}
                                            size='sm'
                                            variant={(variant.isValid == undefined || variant.isValid) ? selectedVariant == index ? 'outline-primary' : 'outline-secondary' : 'outline-danger'}
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
                        <div>
                            <button className='icon-btn' title='Переместить ниже' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex + 1})}><i className='fas fa-angle-down fa-lg'/></button>
                            <button className='icon-btn mr-2' title='Переместить выше' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex - 1})}><i className='fas fa-angle-up fa-lg'/></button>
                            <button className='icon-btn' title='Удалить вопрос' onClick={() => markForDeletion()}><i className='fas fa-times fa-lg'/></button>
                        </div>
                    </div>
                    <div onClick={() => onQuestionEdit()}>
                        <TaskQuestionContext.Provider value={{ question, setQuestionVariant, pasteVariantAfter, variantCount, markForDeleteVariant, deleteQuestionVariant }}>
                            {(questionVariants) && questionVariants.map((variant, index) => {
                                if(!isEmpty(variant)) return (
                                    <QuestionVariant key={index} show={selectedVariant == index} index={index} questionVariant={variant} isEditing={isEditing}/>
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
            </div>
            {isEditing &&
                <div className='question-card-actions'>
                    <Button 
                        variant={isValid ? 'outline-primary' : 'outline-danger'}
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
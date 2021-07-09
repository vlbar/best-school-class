import React, { useContext, useState, useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { sortableHandle } from 'react-sortable-hoc'
import { addErrorNotification } from '../../notifications/notifications'
import ProcessBar from '../../process-bar/ProcessBar'
import { useTaskSaveManager, isEquivalent, SAVED_STATUS, ERROR_STATUS, VALIDATE_ERROR_STATUS } from './TaskSaveManager'
import { QuestionsContext } from './QuestionsList'
import { QuestionVariant } from './QuestionVariant'
import { tasksBaseUrl } from './TaskEditor'
import { questionPartUrl } from './QuestionsList'
import { variantsPartUrl } from './QuestionVariant'
import axios from 'axios'
import './TaskQuestion.less'

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
    const { taskId, questionToChange, setQuestionToChange, addQuestionAfter, moveQuestion, deleteQuestion } = useContext(QuestionsContext)
    const [isFetching, setIsFetching] = useState(false)
    const [isHover, setIsHover] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState(0)
    const [questionVariants, setQuestionVariants] = useState(undefined)

    const statusBySub = useTaskSaveManager(updateQuestion)
    const lastSavedData = useRef({})

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

        if(!question.detached) lastSavedData.current = question
    }, [])

    function updateQuestion() {
        if(!isDeleted && isEquivalent(question, lastSavedData.current)) { 
            statusBySub(SAVED_STATUS)
            return
        }

        if(question.detached) {
            let addableQuestion = {...question, id: null}
            add(addableQuestion, taskId)
                .then(res => {
                    let fetchedData = res.data
                    question.detached = false
                    question.id = fetchedData.id

                    lastSavedData.current = question
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
                        lastSavedData.current = question
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
                fetchedData[0] = questionVariants[0]
                setQuestionVariants(fetchedData)
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
        console.log(questionVariants[index])
        let cleanedVariants = questionVariants
        cleanedVariants.splice(index, 1)
        setQuestionVariants(cleanedVariants)
    }

    let variantCount = (questionVariants) ? questionVariants.filter(x => !x.markForDelete).length : 0
    let num = 1
    let isEditing = (questionToChange ? questionToChange === index : false)
    if(!isDeleted) return (
        <div>
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
                                    size='sm' 
                                            size='sm'
                                            variant={selectedVariant == index ? 'outline-primary' : 'outline-secondary'}
                                    variant={selectedVariant == index ? 'outline-primary' : 'outline-secondary'} 
                                            variant={selectedVariant == index ? 'outline-primary' : 'outline-secondary'}
                                            onClick={() => selectVartiant(index)}
                                            className={`question-variant-btn ${(selectedVariant !== index && ' hover-border')}`}
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
                            <button className='icon-btn' title='Переместить выше' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex - 1})}><i className='fas fa-angle-up fa-lg'/></button>
                            <button className='icon-btn' title='Удалить вопрос' onClick={() => markForDeletion()}><i className='fas fa-times fa-lg'/></button>
                        </div>
                    </div>
                    <div onClick={() => onQuestionEdit()}>
                        <TaskQuestionContext.Provider value={{ question, variantCount, markForDeleteVariant, deleteQuestionVariant }}>
                            {(questionVariants) && questionVariants.map((variant, index) => {
                                if(!isEmpty(variant)) return (
                                    <QuestionVariant key={index} show={selectedVariant == index} index={index} questionVariant={variant} isEditing={isEditing}/>
                                )
                            })}
                        </TaskQuestionContext.Provider>
                    </div>
                </div>
            </div>
            {isEditing &&
                <div className='question-card-actions'>
                    <Button 
                        variant='outline-primary'
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
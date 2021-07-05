import React, { useContext, useState } from 'react'
import { Button } from 'react-bootstrap'
import { sortableHandle } from 'react-sortable-hoc'
import { addErrorNotification } from '../../notifications/notifications'
import { useTaskSaveManager, SAVED_STATUS, ERROR_STATUS, VALIDATE_ERROR_STATUS } from './TaskSaveManager'
import { QuestionContext } from './QuestionsList'
import { QuestionVariant } from './QuestionVariant'
import { tasksBaseUrl } from './TaskEditor'
import { questionPartUrl } from './QuestionsList'
import axios from 'axios'
import './TaskQuestion.less'

async function add(question, taskId) {
    return axios.post(`${tasksBaseUrl}/${taskId}/${questionPartUrl}`, question)
}

async function update(question, taskId) {
    return axios.put(`${tasksBaseUrl}/${taskId}/${questionPartUrl}/${question.id}`, question)
}

const DragHandle = sortableHandle(() => <button className='icon-btn' title='Переместить'><i className='fas fa-grip-lines fa-lg'></i></button>)

export const TaskQuestion = ({index, question}) => {
    let arrayIndex = index - 1
    const { taskId, questionToChange, setQuestionToChange, addQuestionAfter, moveQuestion } = useContext(QuestionContext)
    const [isHover, setIsHover] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState(0)
    const [questionVariants, setQuestionVariants] = useState([
        {
            id: undefined,
            formulation: '',
            position: 1,
            questionId: question.id,
            numberOfSymbols: '',
            type: 'TEXT_QUESTION'
        }
    ])

    const statusBySub = useTaskSaveManager(updateQuestion)

    function updateQuestion() {
        if(question.detached) {
            question.id = null
            add(question, taskId)
                .then(res => {
                    let fetchedData = res.data
                    question.detached = false
                    question.id = fetchedData.id

                    statusBySub(SAVED_STATUS)
                })
                .catch(error => {
                    addErrorNotification('Не удалось сохранить задание. \n' + error)
                    statusBySub(ERROR_STATUS)
                    question.id = Math.random()
                })
        } else {
            update(question, taskId)
                .then(res => {
                    let fetchedData = res.data
                    statusBySub(SAVED_STATUS)
                })
                .catch(error => {
                    addErrorNotification('Не удалось сохранить задание. \n' + error)
                    statusBySub(ERROR_STATUS)
                    question.id = Math.random()
                })
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
    }


    const onQuestionEdit = () => {
        setQuestionToChange(index)
    }

    let isEditing = (questionToChange ? questionToChange === index : false)
    return (
        <div>
            <div className={'question-card' + (isHover || isEditing ? ' hover':'') + (isEditing ? ' edit':'')} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                <div className='question-card-header'>
                    <div>
                        <DragHandle />
                        {questionVariants.map((variant, index) => 
                            <Button
                                key={index}
                                size='sm' 
                                variant={selectedVariant == index ? 'outline-primary' : 'outline-secondary'} 
                                onClick={() => setSelectedVariant(index)}
                                className={'question-variant-btn' + (selectedVariant !== index ? ' hover-border':'')}
                            >
                                {index + 1}
                            </Button>
                        )}
                        {questionVariants.length < 10 && <Button
                            size='sm' 
                            variant='outline-secondary'
                            className='question-variant-btn hover-border on-card-hover'
                            onClick={() => pushNewVariant()}
                        >+</Button>}
                    </div>
                    <div>
                        <button className='icon-btn' title='Переместить ниже' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex + 1})}><i className='fas fa-angle-down fa-lg'/></button>
                        <button className='icon-btn' title='Переместить выше' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex - 1})}><i className='fas fa-angle-up fa-lg'/></button>
                        <button className='icon-btn' title='Удалить вопрос'><i className='fas fa-times fa-lg'/></button>
                    </div>
                </div>
                <div onClick={() => onQuestionEdit()}>
                    {questionVariants.map((variant, index) => 
                        <QuestionVariant key={index} show={selectedVariant == index} question={question} questionVariant={variant} isEditing={isEditing}/>
                    )}
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
}
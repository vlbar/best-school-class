import React, { useState, useEffect, useReducer, useRef } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { sortableContainer, sortableElement, arrayMove } from 'react-sortable-hoc'
import { TaskQuestion } from './TaskQuestion'
import { addErrorNotification } from '../../notifications/notifications'
import ProcessBar from '../../process-bar/ProcessBar'
import axios from 'axios'
import './TaskEditor.less'

const MINUTES = 'MINUTES'
const HOURS = 'HOURS'
const DAYS = 'DAYS'
const getTimeName = (type, num) => {
    switch(type) {
        case MINUTES:
            if(num == 1) return 'Минута'
            else if(num >= 2 && num <= 4) return 'Минуты'
            else return 'Минут'
        case HOURS:
            if(num == 1) return 'Час'
            else if(num >= 2 && num <= 4) return 'Часа'
            else return 'Часов'
        case DAYS:
            if(num == 1) return 'День'
            else if(num >= 2 && num <= 4) return 'Дня'
            else return 'Дней'
    }
}

//reducer
const TASK = 'TASK'
const TASK_NAME = 'NAME'
const TASK_DESC = 'DESCRIPTION'
const TASK_MAX_SCORE = 'MAX_SCORE'
const TASK_DURATION = 'DURATION'

const taskReducer = (state, action) => {
    switch (action.type) {
        case TASK:
            return { ...action.payload }
        case TASK_NAME:
            return { ...state, name: action.payload }
        case TASK_DESC:
            return { ...state, description: action.payload }
        case TASK_MAX_SCORE:
            return { ...state, maxScore: action.payload }
        case TASK_DURATION:
            return { ...state, duration: action.payload }
        default:
            return state
    }
}

// sortable hoc
const SortableContainer = sortableContainer(({children}) => <div>{children}</div>)
const SortableItem = sortableElement(({question, questionToEditHadnle, questionToEdit}) => (
    <TaskQuestion question={question} questionToEdit={questionToEdit} questionToEditHadnle={questionToEditHadnle}/>
))

const tasksBaseUrl = '/tasks'

async function fetchTaskDetails(taskId) {
    return axios.get(`${tasksBaseUrl}/${taskId}`)
}

export const TaskEditor = ({taskId}) => {
    const [isTaskFetching, setIsTaskFetching] = useState(true)
    const [questions, setQuestions] = useState([
        {
            id: 1
        },
        {
            id: 2
        },
        {
            id: 3
        }
    ])

    const [questionToChange, setQuestionToChange] = useState()
    const onSortEnd = ({oldIndex, newIndex}) => {
        setQuestions(arrayMove(questions, oldIndex, newIndex))
    }

    useEffect(() => {
        fetchTask()
    }, [])

    const [taskDetails, taskDispatch] = useReducer(taskReducer, {})

    const setTask = (task) => taskDispatch({ type: TASK, payload: task })
    const setName = (name) => taskDispatch({ type: TASK_NAME, payload: name })
    const setDescription = (description) => taskDispatch({ type: TASK_DESC, payload: description })
    const setMaxScore = (maxScore) => taskDispatch({ type: TASK_MAX_SCORE, payload: maxScore })
    const setDuration = (duration) => taskDispatch({ type: TASK_DURATION, payload: duration })

    const fetchTask = (state) => {
        setIsTaskFetching(true)
        fetchTaskDetails(taskId)
            .then(res => {
                let fetchedData = res.data
                setTask(fetchedData)
                setIsTaskFetching(false)
            })
            .catch(error => 
                addErrorNotification('Не удалось загрузить информацию о задании. \n' + (error?.response?.data ? error.response.data.message : error))
            )
    }

    return (
        <>
            <Container>
                <h4 className='mt-3'>Задание</h4>
                <ProcessBar active={isTaskFetching} height='.18Rem' className='mb-2'/>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Название
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control 
                            type='text' 
                            placeholder='Введите название задания...'
                            disabled={isTaskFetching}
                            value={taskDetails?.name || ''}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Описание задания
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control 
                            as='textarea' 
                            placeholder='Введите описание задания...' 
                            rows={3}
                            disabled={isTaskFetching}
                            value={taskDetails?.description || ''}
                            onChange={(e) => setDescription(e.target.value)}
                            style={{maxHeight: '86px', minHeight: '40px'}}
                        />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2} className='pt-0'>
                        Максимальная оценка
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control 
                            type='number' 
                            min={1} 
                            disabled={isTaskFetching}
                            value={taskDetails?.maxScore || ''}
                            onChange={(e) => setMaxScore(e.target.value)}
                            placeholder='Введите максимальный балл...' />
                        <Form.Text className="text-muted">
                            К этому числу будут переводится количество баллов, полученные учеником
                        </Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Длительность
                    </Form.Label>
                    <Col sm={10}>
                        <div className='task-duration'>
                            <Form.Control 
                                type='number' 
                                min={1}
                                disabled={isTaskFetching}
                                value={taskDetails?.duration || ''}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                            <Form.Control as="select">
                                <option>{getTimeName(MINUTES, taskDetails?.duration || '')}</option>
                                <option>{getTimeName(HOURS, taskDetails?.duration || '')}</option>
                                <option>{getTimeName(DAYS, taskDetails?.duration || '')}</option>
                            </Form.Control>
                        </div>
                    </Col>
                </Form.Group>
                <hr/>
                <SortableContainer onSortEnd={onSortEnd} useDragHandle>
                    {questions.map((question, index) => (
                        <SortableItem key={question.id} index={index} question={question} questionToEdit={questionToChange} questionToEditHadnle={setQuestionToChange} />
                    ))}
                </SortableContainer>
                <Button variant='outline-primary mb-4' className='w-100'>Добавить</Button>
            </Container>
        </>
    )
}
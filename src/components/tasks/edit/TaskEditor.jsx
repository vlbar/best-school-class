import React, { useState, useEffect, useReducer, useRef, useContext } from 'react'
import { Container, Row, Col, Form, Button, Dropdown, ButtonGroup } from 'react-bootstrap'
import { sortableContainer, sortableElement, arrayMove } from 'react-sortable-hoc'
import { TaskQuestion } from './TaskQuestion'
import { addErrorNotification } from '../../notifications/notifications'
import { TaskSaveContext, SAVED_STATUS, ERROR_STATUS } from './TaskSaveManager'
import ProcessBar from '../../process-bar/ProcessBar'
import { LoadingList } from '../../loading/LoadingList'
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
const SortableItem = sortableElement(({index_, question, questionToEditHadnle, questionToEdit}) => (
    <TaskQuestion index={index_} question={question} questionToEdit={questionToEdit} questionToEditHadnle={questionToEditHadnle}/>
))

const tasksBaseUrl = '/tasks'

async function fetchTaskDetails(taskId) {
    return axios.get(`${tasksBaseUrl}/${taskId}`)
}

async function updateTaskDetails(taskId, task) {
    return axios.put(`${tasksBaseUrl}/${taskId}`, task)
}

const questionPartUrl = 'questions'

async function fetchQuestions(taskId, page, size) {
    return axios.get(`${tasksBaseUrl}/${taskId}/${questionPartUrl}?page=${page}&size=${size}`)
}

export const TaskEditor = ({taskId}) => {
    const { displayStatus, setTaskName, addSubscriber, onSaveClick, statusBySub } = useContext(TaskSaveContext)
    const [isTaskFetching, setIsTaskFetching] = useState(true)
    const [isInputBlock, setIsInputBlock] = useState(true)

    const [isQuestionsFetching, setIsQuestionsFetching] = useState(false)
    const [questions, setQuestions] = useState(undefined)
    const pagination = useRef({
        page: 1, 
        size: 10, 
        total: undefined
    })

    const [questionToChange, setQuestionToChange] = useState(null)
    const onSortEnd = ({oldIndex, newIndex}) => {
        setQuestions(arrayMove(questions, oldIndex, newIndex))
    }

    useEffect(() => {
        fetchTask()
        addSubscriber(() => setForceSave(true))
    }, [])

    const [taskDetails, taskDispatch] = useReducer(taskReducer, {})

    const setTask = (task) => taskDispatch({ type: TASK, payload: task })
    const setName = (name) => taskDispatch({ type: TASK_NAME, payload: name })
    const setDescription = (description) => taskDispatch({ type: TASK_DESC, payload: description })
    const setMaxScore = (maxScore) => taskDispatch({ type: TASK_MAX_SCORE, payload: maxScore })
    const setDuration = (duration) => taskDispatch({ type: TASK_DURATION, payload: duration })

    const fetchTask = (state) => {
        setIsTaskFetching(true)
        setIsInputBlock(true)
        fetchTaskDetails(taskId)
            .then(res => {
                let fetchedData = res.data
                setTask(fetchedData)
                setTaskName(fetchedData.name)

                setIsTaskFetching(false)
                setIsInputBlock(false)

                fetchTaskQuestions(1)
            })
            .catch(error => 
                addErrorNotification('Не удалось загрузить информацию о задании. \n' + (error?.response?.data ? error.response.data.message : error))
            )
            .finally(() => {
                setIsTaskFetching(false)
            })
    }

    const [forceSave, setForceSave] = useState(false)
    useEffect(() => {
        if(forceSave) saveTaskDetails()
    }, [forceSave])

    const saveTaskDetails = () => {
        updateTaskDetails(taskId, taskDetails)
            .then(res => { 
                statusBySub(SAVED_STATUS)
            })
            .catch(error => {
                statusBySub(ERROR_STATUS)
                addErrorNotification('Не удалось загрузить информацию о задании. \n' + (error?.response?.data?.message ? error.response.data.message : error))
            })
            .finally(() => {
                setForceSave(false)
            })
    }

    const fetchTaskQuestions = (page) => {
        setIsQuestionsFetching(true)
        fetchQuestions(taskId, page, pagination.current.size)
            .then(res => {
                let fetchedData = res.data
                let items = fetchedData.items

                pagination.current.page = page
                pagination.current.total = fetchedData.totalItems

                if(page == 1)
                    setQuestions(items)
                else
                    setQuestions([...questions, ...items])
            })
            .catch(error => 
                addErrorNotification('Не удалось загрузить информацию о задании. \n' + (error?.response?.data ? error.response.data.message : error))
            )
            .finally(() => {
                setIsQuestionsFetching(false)
            })
    }

    const addQuestionAfter = (position) => {
        //let targetQuestion = questions.find(x => x.position == position)
        //let targetIndex = questions.indexOf(targetQuestion) + 1
        
        let curQuestions = questions || []
        curQuestions.push({
            position: position,
            maxScore: 1
        })
        setQuestions(curQuestions)
    }

    const getMessage = () => {
        if(taskDetails?.name) {
            if(questions) {
                if(questions.length == 0)
                    return  <>
                                <h5>Увы, но вопросы еще не добавлены.</h5>
                                <p className='text-muted'>Чтобы вопросы были в списке, для начали их нужно добавить.</p>
                            </>
            } else
                if(!isQuestionsFetching)
                return  <>
                            <h5>Произошла ошибка</h5>
                            <p className='text-muted'>Не удалось загрузить список вопросов задания.</p>
                        </>
        } else
            if(!isTaskFetching)
                return  <>
                            <h5>Произошла ошибка</h5>
                            <p className='text-muted'>Не удалось загрузить данные задания.</p>
                        </>

        return undefined
    }

    let message = getMessage()
    return (
        <>
            <Container>
                <div className='d-flex justify-content-between'>
                    <h4 className='mt-2'>Задание</h4>
                    <div className='d-flex justify-content-between mt-2'>
                        <div className='save-status'>{displayStatus}</div>
                        <Dropdown as={ButtonGroup}>
                            <Button variant='outline-primary' onClick={() => onSaveClick()}>Сохранить</Button>
                            <Dropdown.Toggle split variant='outline-primary' />

                            <Dropdown.Menu>
                                <Dropdown.Item>Завершить</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>
                <ProcessBar active={isTaskFetching} height='.18Rem' className='mt-2 mb-1'/>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Название
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control 
                            type='text' 
                            placeholder='Введите название задания...'
                            disabled={isInputBlock}
                            value={taskDetails?.name || ''}
                            onChange={(e) => {
                                setName(e.target.value)
                                setTaskName(e.target.value)
                            }}
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
                            disabled={isInputBlock}
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
                            disabled={isInputBlock}
                            value={taskDetails?.maxScore || ''}
                            onChange={(e) => setMaxScore(e.target.value)}
                            placeholder='Введите максимальный балл...' />
                        <Form.Text className='text-muted'>
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
                                disabled={isInputBlock}
                                value={taskDetails?.duration || ''}
                                onChange={(e) => setDuration(e.target.value)}
                            />
                            <Form.Control as='select'>
                                <option>{getTimeName(MINUTES, taskDetails?.duration || '')}</option>
                                <option>{getTimeName(HOURS, taskDetails?.duration || '')}</option>
                                <option>{getTimeName(DAYS, taskDetails?.duration || '')}</option>
                            </Form.Control>
                        </div>
                    </Col>
                </Form.Group>
                <hr/>
                {questions !== undefined ? <SortableContainer onSortEnd={onSortEnd} useDragHandle>
                    {questions.map((question, index) => (
                        <SortableItem key={index} index={index} index_={index + 1} question={question} questionToEdit={questionToChange} questionToEditHadnle={setQuestionToChange} />
                    ))}
                </SortableContainer>:''}
                {(questions !== undefined && !isQuestionsFetching && pagination.current.page * pagination.current.size < pagination.current.total) &&
                    <button 
                        className="fetch-types-btn mb-2" 
                        onClick={() => fetchTaskQuestions(pagination.current.page + 1)} 
                        disabled={isQuestionsFetching}
                    >
                        Загрузить еще
                    </button>
                }
                {(isQuestionsFetching) &&
                    <ProcessBar height='.18Rem' className='mb-2'/>
                }
                {(isTaskFetching || isQuestionsFetching) &&
                    <LoadingList widths={[100, 100]} itemHeight='240px' itemMarginLeft='0'/>    
                }
                {message && <div className='task-message-container'>{message}</div>}
                <Button 
                    variant='outline-primary mb-4' 
                    className='w-100'
                    onClick={() => addQuestionAfter(questions[questions.length - 1]?.position + 1 || 1)}
                    disabled={!(isTaskFetching && isQuestionsFetching)}
                >
                    Добавить
                </Button>
            </Container>
        </>
    )
}
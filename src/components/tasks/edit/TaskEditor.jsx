import React, { useState, useEffect, useLayoutEffect, useReducer, useRef, useContext } from 'react'
import { Container, Row, Col, Form, Button, Dropdown, ButtonGroup } from 'react-bootstrap'
import { createError } from '../../notifications/notifications'
import { TaskSaveContext, useTaskSaveManager, isEquivalent, SAVED_STATUS, ERROR_STATUS, VALIDATE_ERROR_STATUS } from './TaskSaveManager'
import { QuestionsList } from './QuestionsList'
import TaskTypeDropdown from '../TaskTypeDropdown'
import ProcessBar from '../../process-bar/ProcessBar'
import usePageTitle from '../../feedback/usePageTitle'
import useBestValidation, { STRING_TYPE, NUMBER_TYPE } from './useBestValidation'
import JoditEditor from 'jodit-react'
import './TaskEditor.less'
import Resource from '../../../util/Hateoas/Resource'

//time
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
const TASK_TYPE = 'TASK_TYPE'
const IS_COMPLETED = 'IS_COMPLETED'

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
        case TASK_TYPE:
            return { ...state, taskType: action.payload }
        case IS_COMPLETED:
            return { ...state, isCompleted: action.payload }
        default:
            return state
    }
}

//validation
const taskValidationSchema = {
    name: {
        type: STRING_TYPE,
        required: ['Не введено название задания'],
        min: [5, 'Слишком короткое название'],
        max: [100, 'Слишком длинное название']
    },
    maxScore: {
        type: NUMBER_TYPE,
        required: ['Не введена оценка'],
        min: [1, 'Оценка должа быть положительной'],
        max: [9223372036854775807, 'Слишком большая оценка']
    },
    duration: {
        type: NUMBER_TYPE,
        nullable: true,
        min: [1, 'Время должна быть положительным'],
        max: [99999, 'Слишком большое время']
    }
}

//requests
export const tasksBaseUrl = '/tasks'
const baseLink = Resource.basedOnHref(tasksBaseUrl).link()
const taskLink = (id) => { return Resource.basedOnHref(`${tasksBaseUrl}/${id}`).link() }

export const TaskEditor = ({taskId}) => {
    const { autoSave, displayStatus, onSaveClick } = useContext(TaskSaveContext)
    const [isTaskFetching, setIsTaskFetching] = useState(true)
    const [isInputBlock, setIsInputBlock] = useState(true)
    const [questionsLink, setQuestionsLink] = useState(undefined)

    const taskValidation = useBestValidation(taskValidationSchema)

    const [taskDetails, taskDispatch] = useReducer(taskReducer, {})
    const setTask = (task) => taskDispatch({ type: TASK, payload: task })
    const setName = (name) => taskDispatch({ type: TASK_NAME, payload: name })
    const setDescription = (description) => taskDispatch({ type: TASK_DESC, payload: description })
    const setMaxScore = (maxScore) => taskDispatch({ type: TASK_MAX_SCORE, payload: maxScore })
    const setDuration = (duration) => taskDispatch({ type: TASK_DURATION, payload: duration })
    const setTaskType = (taskType) => taskDispatch({ type: TASK_TYPE, payload: taskType })
    const setIsComplited = (isCompleted) => taskDispatch({ type: IS_COMPLETED, payload: isCompleted })

    const { callbackSubStatus, setIsChanged } = useTaskSaveManager(saveTaskDetails)
    const lastSavedData = useRef({})
    const [isBarShow, setIsBarShow] = useState(false)

    const descriptionEditor = useRef(null)
    
    // all options from https://xdsoft.net/jodit/doc/
    const descriptionEditorConfig = {
        readonly: isInputBlock,
        showCharsCounter: false,
        showWordsCounter: false,
        showXPathInStatusbar: false,
        enter: 'br',
        buttons: [
            'bold', 'strikethrough', 'underline', 'italic', 'paragraph', '|',
            'ul', 'ol', '|',
            'outdent', 'indent',  '|',
            'image', 'link', '|',
            'align', 'undo', 'redo', '|',
            'eraser', 'about'
        ],
        removeButtons: [
            'source', 'table', 'font', 'fontsize', 'brush',
            'video', 'copyformat', 'fullsize', 'print', 'color'
        ],
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        defaultActionOnPaste: "insert_clear_html"
    }

    usePageTitle({title: taskDetails.name, postfix: 'Best School Class Задания'})

    useEffect(() => {
        setIsChanged(!isEquivalent(taskDetails, lastSavedData.current))
    }, [taskDetails])

    useEffect(() => {
        fetchTask()
    }, [])

    const fetchTask = () => {
        setIsInputBlock(true)
        taskLink(taskId)
            .fetch(setIsTaskFetching)
            .then(data => {
                setQuestionsLink(data.link('questions'))
                setTask(data)
                lastSavedData.current = data

                setIsTaskFetching(false)
                setIsInputBlock(false)
            })
            .catch(error => {
                callbackSubStatus(ERROR_STATUS)
                createError('Не удалось загрузить информацию о задании.', error)
            })
    }

    function saveTaskDetails() {
        if(isEquivalent(taskDetails, lastSavedData.current)) { 
            callbackSubStatus(SAVED_STATUS)
            return
        }

        if(!taskValidation.validate(taskDetails)) {
            callbackSubStatus(VALIDATE_ERROR_STATUS)
            return
        }

        let taskToUpdate = taskDetails
        taskToUpdate.taskTypeId = taskDetails?.taskType.id

        taskLink(taskId)
            .put(taskToUpdate)
            .then(data => { 
                callbackSubStatus(SAVED_STATUS)
                lastSavedData.current = taskToUpdate
            })
            .catch(error => {
                callbackSubStatus(ERROR_STATUS)
                createError('Не удалось сохранить информацию о задании.', error)
            })
    }

    //bar show
    const listener = (e) => {
        setIsBarShow(window.scrollY >= 100)
    }

    useLayoutEffect(() => {
        window.addEventListener('scroll', listener)
        return () => {
            window.removeEventListener('scroll', listener)
        }
    }, [])

    return (
        <>
            <div className={'task-save-panel' + (isBarShow ? ' show':'')}>
                <Container>
                    <Row>
                        <Col md={8} className='d-flex mt-2'>
                            <h4>Задание</h4>
                            <span className='label-center text-ellipsis ml-2'>
                                {taskDetails?.name}
                                <button className='icon-btn ml-1' onClick={() => window.scrollTo(0, 0)}>
                                    <i className='fas fa-pen fa-xs'></i>
                                </button>
                            </span>
                        </Col>
                        <Col md={4} className='d-flex justify-content-between mt-2'>
                            <div className='save-status'>{displayStatus}</div>
                            <Dropdown as={ButtonGroup}>
                                <Button variant='outline-primary' onClick={() => onSaveClick()}>Сохранить</Button>
                                <Dropdown.Toggle split variant='outline-primary' />

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => setIsComplited(!taskDetails.isCompleted)}>{(taskDetails?.isCompleted) && <i className='fas fa-check'></i>} Завершить</Dropdown.Item>
                                    <Dropdown.Item onClick={() => autoSave.setIsAutoSaveEnabled(!autoSave.isEnabled)}>{(autoSave.isEnabled) && <i className='fas fa-check'></i>} Автосохранение</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Container>
                <div className='d-flex justify-content-between'>
                    <h4 className='mt-2'>Задание</h4>
                    <div className='d-flex justify-content-between mt-2'>
                        <div className='save-status'>{displayStatus}</div>
                        <Dropdown as={ButtonGroup}>
                            <Button variant='outline-primary' onClick={() => onSaveClick()}>Сохранить</Button>
                            <Dropdown.Toggle split variant='outline-primary' />

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => setIsComplited(!taskDetails.isCompleted)}>{(taskDetails?.isCompleted) && <i className='fas fa-check'></i>} Завершить</Dropdown.Item>
                                <Dropdown.Item onClick={() => autoSave.setIsAutoSaveEnabled(!autoSave.isEnabled)}>{(autoSave.isEnabled) && <i className='fas fa-check'></i>} Автосохранение</Dropdown.Item>
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
                            name='name'
                            placeholder='Введите название задания...'
                            disabled={isInputBlock}
                            autoFocus={taskValidation.errors.name !== undefined}
                            isInvalid={taskValidation.errors.name !== undefined}
                            value={taskDetails?.name || ''}
                            onBlur={taskValidation.blurHandle}
                            onChange={(e) => {
                                setName(e.target.value)
                                taskValidation.changeHandle(e)
                            }}
                        />
                        <Form.Control.Feedback type="invalid">
                            {taskValidation.errors.name}
                        </Form.Control.Feedback>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Описание задания
                    </Form.Label>
                    <Col sm={10}>
                        <JoditEditor
                            ref={descriptionEditor}
                            value={taskDetails.description}
                            config={descriptionEditorConfig}
                            tabIndex={1} 
                            onBlur={newContent => setDescription(newContent)} 
                            onChange={newContent => {}}
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
                            name='maxScore'
                            placeholder='Введите максимальный балл...'
                            disabled={isInputBlock}                          
                            autoFocus={taskValidation.errors.maxScore !== undefined}
                            isInvalid={taskValidation.errors.maxScore !== undefined}
                            value={(taskDetails?.maxScore && taskDetails.maxScore !== null) ? taskDetails.maxScore : ''}
                            onBlur={taskValidation.blurHandle}
                            onChange={(e) => {
                                setMaxScore(e.target.value)
                                taskValidation.changeHandle(e)
                            }} />
                        <Form.Control.Feedback type='invalid'>
                            {taskValidation.errors.maxScore}
                        </Form.Control.Feedback>
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
                                name='duration'
                                min={1}
                                max={99999}
                                disabled={isInputBlock}
                                autoFocus={taskValidation.errors.duration !== undefined}
                                isInvalid={taskValidation.errors.duration !== undefined}
                                value={taskDetails?.duration || ''}
                                onBlur={taskValidation.blurHandle}
                                onChange={(e) => {
                                    setDuration(e.target.value)
                                    taskValidation.changeHandle(e)
                                }}
                            />
                            <Form.Control as='select'>
                                <option>{getTimeName(MINUTES, taskDetails?.duration || '')}</option>
                                <option>{getTimeName(HOURS, taskDetails?.duration || '')}</option>
                                <option>{getTimeName(DAYS, taskDetails?.duration || '')}</option>
                            </Form.Control>
                            <Form.Control.Feedback type='invalid'>
                                {taskValidation.errors.duration}
                            </Form.Control.Feedback>
                        </div>
                    </Col>
                </Form.Group>
                
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Тип задания
                    </Form.Label>
                    <Col sm={10}>
                        <TaskTypeDropdown initialSelectedType={taskDetails.taskType} onSelect={(t) => setTaskType(t)} placeholder='Выберите тип...' disabled={isInputBlock} className='bordered' />
                    </Col>
                </Form.Group>
                <hr/>
                {(taskDetails?.name === undefined && !isTaskFetching) && (
                     <div className='task-message-container'>
                        <h5>Произошла ошибка</h5>
                        <p className='text-muted'>Не удалось загрузить данные задания.</p>
                    </div>
                )}
                {taskDetails?.name && <QuestionsList questionsLink={questionsLink} />}
            </Container>
        </>
    )
}
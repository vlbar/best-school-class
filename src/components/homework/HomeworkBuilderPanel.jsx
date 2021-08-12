import React, { useState, useContext } from 'react'
import { Alert, Button, Row, Col, Badge, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

import { getTaskTypeColor } from '../tasks/TaskTypeDropdown'
import { HomeworkContext } from './HomeworkBuilderContext'
import SelectHomeworkModal from './SelectHomeworkModal'
import ProcessBar from '../process-bar/ProcessBar'
import GroupSelect from './filters/GroupSelect'
import './HomeworkBuilderPanel.less'


const HomeworkBuilderPanel = () => {
    const { homework } = useContext(HomeworkContext)
    let isFetching = homework.isFetching ?? false

    const [homeworkOpeningDate, setHomeworkOpeningDate] = useState('')
    const [homeworkOpeningTime, setHomeworkOpeningTime] = useState('')
    const [homeworkClosingDate, setHomeworkClosingDate] = useState('')
    const [homeworkClosingTime, setHomeworkClosingTime] = useState('')

    const [isHomeworkSelectShow, setIsHomeworkSelectShow] = useState(false)
    const history = useHistory()

    const onSelectHomeworkHandler = (selectedHomework) => {
        if (!selectedHomework) {
            selectedHomework = {}
        } else {
            parseDate(selectedHomework.openingDate, setHomeworkOpeningDate, setHomeworkOpeningTime)
            parseDate(selectedHomework.endingDate, setHomeworkClosingDate, setHomeworkClosingTime)
        }

        homework.setHomework(selectedHomework)
        setIsHomeworkSelectShow(false)
    }

    const setOpeningDate = () => {
        homework.setOpeningDate(new Date(homeworkOpeningDate + ' ' + (homeworkOpeningTime ?? '00:00')).getTime())
    }

    const setClosingDate = () => {
        homework.setEndingDate(new Date(homeworkClosingDate + ' ' + (homeworkClosingTime ?? '00:00')).getTime())
    }

    return (
        <>
            <Alert variant='primary' className='position-relative mt-3 p-0'>
                {isFetching && (<ProcessBar height='.18Rem' className='position-absolute' />)}
                <div className='px-4 py-3'>
                {homework.current ? (
                    <div>
                        <div className='d-flex justify-content-between'>
                            <span className='text-semi-bold'>Домашнее задание</span>
                            <button className='btn-icon' title='Удалить' onClick={() => homework.setHomework(undefined)} disabled={isFetching}>
                                <i className='fas fa-times fa-sm' />
                            </button>
                        </div>

                        <Row>
                            <Col md={6}>
                                <span className='font-size-14'>Параметры:</span>
                                <Row>
                                    <Col sm={4} className='mt-1 mb-1'>
                                        Класс
                                    </Col>
                                    <Col sm={8} className='mb-2'>
                                        <GroupSelect
                                            placeholder='Выберите'
                                            size='sm'
                                            className='primary-select'
                                            initialSelectedGroup={homework.current.group}
                                            onSelect={homework.setGroup}
                                            disabled={isFetching}
                                        />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4} className='mt-1 mb-1'>
                                        <span>Дата начала:</span>
                                        <OverlayTrigger
                                            placement={'right'}
                                            overlay={
                                                <Tooltip id={`tooltip-task-date`}>
                                                    <b>А вы знали?</b> Домашнее задание до даты начала не отображаются у учеников.
                                                </Tooltip>
                                            }>
                                            <i className='fas fa-question fa-xs text-light-primary p-1'></i>
                                        </OverlayTrigger>
                                    </Col>
                                    <Col sm={8} className='mb-2'>
                                        <input
                                            type='date'
                                            className='light-primary-input mr-2'
                                            value={homeworkOpeningDate}
                                            onChange={(e) => setHomeworkOpeningDate(e.target.value)}
                                            onBlur={(e) => setOpeningDate(e)}
                                            disabled={isFetching}
                                        />
                                        <input
                                            type='time'
                                            className='light-primary-input'
                                            value={homeworkOpeningTime}
                                            onChange={(e) => setHomeworkOpeningTime(e.target.value)}
                                            onBlur={(e) => setOpeningDate(e)}
                                            disabled={isFetching}
                                        />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4} className='mt-1 mb-1'>
                                        Дата окончания:
                                    </Col>
                                    <Col sm={8}>
                                        <input
                                            type='date'
                                            className='light-primary-input mr-2'
                                            value={homeworkClosingDate}
                                            onChange={(e) => setHomeworkClosingDate(e.target.value)}
                                            onBlur={(e) => setClosingDate(e)}
                                            disabled={isFetching}
                                        />
                                        <input
                                            type='time'
                                            className='light-primary-input'
                                            value={homeworkClosingTime}
                                            onChange={(e) => setHomeworkClosingTime(e.target.value)}
                                            onBlur={(e) => setClosingDate(e)}
                                            disabled={isFetching}
                                        />
                                    </Col>
                                </Row>
                            </Col>

                            <Col md={6} className='d-flex flex-column'>
                                <span className='font-size-14'>Задания:</span>
                                <ul className='mb-0'>
                                    {homework.current.tasks &&
                                        homework.current.tasks.map((task) => {
                                            return (
                                                <li key={task.id} className='homework-task-item'>
                                                    <div className='d-flex justify-content-between'>
                                                        <div>
                                                            <span className='mr-2' title={task.description?.replace(/<[^>]*>?/gm, '')}>{task.name}</span>
                                                            {task.taskType != null ? (
                                                                <Badge variant='secondary' style={{ backgroundColor: getTaskTypeColor(task.taskType.id) }}>
                                                                    {task.taskType.name}
                                                                </Badge>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </div>
                                                        <div className='d-flex'>
                                                            <Dropdown className='dropdown-action-menu my-auto'>
                                                                <Dropdown.Toggle size='sm' id='dropdown-basic' disabled={isFetching}>
                                                                    <i className='btn-icon fas fa-ellipsis-h' title='Доп. действия' />
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu>
                                                                    <Dropdown.Item onClick={() => history.push(`courses/${task.courseId}/tasks/${task.id}`)}>
                                                                        Изменить
                                                                    </Dropdown.Item>
                                                                    <Dropdown.Item>
                                                                        <span>Назначить срок</span>
                                                                        <OverlayTrigger
                                                                            placement={'right'}
                                                                            overlay={
                                                                                <Tooltip id={`tooltip-task-date`}>
                                                                                    Позволяет назначить сроки заданнию внутри сроков всего ДЗ. Подходит для
                                                                                    поэтапного выполнения работы (прим. курсовой проект)
                                                                                </Tooltip>
                                                                            }>
                                                                            <i className='far fa-question-circle fa-sm text-muted p-1'></i>
                                                                        </OverlayTrigger>
                                                                    </Dropdown.Item>
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                            <button 
                                                                title='Удалить' 
                                                                className='btn-icon' 
                                                                disabled={isFetching}
                                                                onClick={() => homework.removeTask(task.id)}
                                                            >
                                                                <i className='fas fa-times fa-sm' />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    {(homework.current.tasks == undefined || homework.current.tasks.length == 0) && (
                                        <div className='text-center'>
                                            <h6>Задания ещё не добавлены.</h6>
                                            <p className='text-muted font-size-14 mb-0'>
                                                Выбирите задание из вашего списка в курсе, нажмите три точки по заданию и затем "Добавить в домашнее".
                                            </p>
                                        </div>
                                    )}
                                </ul>
                                <div className='d-flex justify-content-end mt-auto'>
                                    <Button variant='outline-primary' className='mt-2' disabled={isFetching} onClick={() => homework.askHomework()}>
                                        Задать
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                ) : (
                    <div className='d-flex justify-content-between'>
                        <div>
                            <span className='text-semi-bold'>Домашнее задание</span>
                            <br />
                            <span className='font-size-14'>
                                Объединятйе выбранные задания в домашнее и назначайте их выполнение студентам группы на определнное время
                            </span>
                        </div>
                        <div className='align-self-center'>
                            <Button size='sm' variant='outline-primary' onClick={() => setIsHomeworkSelectShow(true)}>
                                Начать
                            </Button>
                        </div>
                    </div>
                )}
                </div>
            </Alert>

            <SelectHomeworkModal show={isHomeworkSelectShow} onSelect={onSelectHomeworkHandler} onClose={() => setIsHomeworkSelectShow(false)} />
        </>
    )
}

const toTwoDigits = (num) => {
    let prefix = num > 9 ? '' : '0'
    return prefix + num
}

const parseDate = (date, setDateCallback, setTimeCallback) => {
    let targetDate = new Date(date)
    setDateCallback(targetDate.toISOString().split('T')[0])
    setTimeCallback(`${toTwoDigits(targetDate.getHours())}:${toTwoDigits(targetDate.getMinutes())}`)
}

export default HomeworkBuilderPanel
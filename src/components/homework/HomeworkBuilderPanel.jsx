import React, { useState, useContext, useEffect } from 'react'
import { Alert, Button, Row, Col, Badge, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

import useBestValidation, { NUMBER_TYPE, OBJECT_TYPE, ARRAY_TYPE } from '../tasks/edit/useBestValidation'
import { getTaskTypeColor } from '../tasks/TaskTypeDropdown'
import { HomeworkContext } from './HomeworkBuilderContext'
import FeedbackMessage from '../feedback/FeedbackMessage'
import SelectHomeworkModal from './SelectHomeworkModal'
import ProcessBar from '../process-bar/ProcessBar'
import GroupSelect from './filters/GroupSelect'
import './HomeworkBuilderPanel.less'

// validation
const homeworkValidationSchema = {
    group: {
        type: OBJECT_TYPE,
        required: ['Не выбран класс'],
    },
    openingDate: {
        type: NUMBER_TYPE,
        required: ['Дата начала ДЗ не введена или недействительна'],
        invalidTerm: ['Дата начала ДЗ должа быть раньше даты окончания'],
    },
    endingDate: {
        type: NUMBER_TYPE,
        required: ['Дата окончания ДЗ не введена или недействительна'],
        min: [Date.now(), 'Некрасиво задавать ДЗ, которое уже завершено'],
        invalidTerm: ['Дата окончания ДЗ должна быть позже даты начала'],
    },
    tasks: {
        type: ARRAY_TYPE,
        required: ['Не добавлены задания'],
    }
}

const HomeworkBuilderPanel = () => {
    const { homework } = useContext(HomeworkContext)
    let isFetching = homework.isFetching ?? false

    const homeworkValidation = useHomeworkValidation(homework.current)

    const [isHomeworkSelectShow, setIsHomeworkSelectShow] = useState(false)
    const history = useHistory()


    const onSelectHomeworkHandler = (selectedHomework) => {
        if (!selectedHomework) {
            selectedHomework = {
                group: undefined,
                tasks: [],
                openingDate: undefined,
                endingDate: undefined,
            }
        }

        homeworkValidation.clearTouches()
        homework.setHomework(selectedHomework)
        setIsHomeworkSelectShow(false)
    }

    const onAskHomeworkHandler = () => {
        if(!homeworkValidation.validate()) {
            return
        }
        
        homework.askHomework()
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
                                            className={homeworkValidation.errors.group ? 'invalid-select' : 'primary-select'}
                                            initialSelectedGroup={homework.current.group}
                                            onSelect={(group) => {
                                                homework.setGroup(group)
                                                homeworkValidation.blurHandle(makeTarget('group', group))
                                            }}
                                            disabled={isFetching}
                                        />
                                        <FeedbackMessage message={homeworkValidation.errors.group} />
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
                                        <DateTimeInput 
                                            name='openingDate'
                                            defaultTime='00:00'
                                            initialValue={homework.current.openingDate}
                                            onChange={(e) => homeworkValidation.changeHandle(e)}
                                            onBlur={(e) => {
                                                homework.setOpeningDate(e.target.value)
                                                homeworkValidation.blurHandle(e)
                                            }}
                                            disabled={isFetching}
                                            isInvalid={homeworkValidation.errors.openingDate}
                                        />
                                        <FeedbackMessage message={homeworkValidation.errors.openingDate} />
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={4} className='mt-1 mb-1'>
                                        Дата окончания:
                                    </Col>
                                    <Col sm={8}>
                                        <DateTimeInput 
                                            name='endingDate'
                                            defaultTime='23:59'
                                            initialValue={homework.current.endingDate}
                                            onChange={(e) => homeworkValidation.changeHandle(e)}
                                            onBlur={(e) => {
                                                homework.setEndingDate(e.target.value)
                                                homeworkValidation.blurHandle(e)
                                            }}
                                            disabled={isFetching}
                                            isInvalid={homeworkValidation.errors.endingDate}
                                        />
                                        <FeedbackMessage message={homeworkValidation.errors.endingDate} />
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
                                <div className='d-flex flex-row mt-auto'>
                                    <FeedbackMessage message={homeworkValidation.errors.tasks} className='mt-3' />
                                    <Button variant='outline-primary' className='ml-auto mt-2' disabled={isFetching} onClick={() => onAskHomeworkHandler()}>
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

const DateTimeInput = ({name, initialValue, defaultTime = '00:00', isInvalid = false, disabled, onChange, onBlur}) => {
    const [dateTime, setDateTime] = useState({date: '', time: ''})

    useEffect(() => {
        if(initialValue) {
            let initialDateTime = new Date(initialValue)
            setDateTime({
                date: initialDateTime.toISOString().split('T')[0],
                time: `${toTwoDigits(initialDateTime.getHours())}:${toTwoDigits(initialDateTime.getMinutes())}`
            })
        }
    }, [initialValue])

    const onChangeHandler = (newValue) => {
        let newDateTime = {...dateTime, ...newValue}
        setDateTime(newDateTime)
        
        let mills = dateTimeToMills(newDateTime)
        onChange(makeTarget(name, mills))
    }

    const onChangeDate = (value) => { onChangeHandler({date: value}) }
    const onChangeTime = (value) => { onChangeHandler({time: value}) }

    const onBlurHandler = () => { 
        let mills = dateTimeToMills(dateTime)
        onBlur(makeTarget(name, mills)) 
    }

    const dateTimeToMills = (dateTime) => {
        let mills = dateToTime(dateTime.date, (dateTime.time ? dateTime.time : defaultTime))
        if(isNaN(mills)) mills = undefined
        return mills
    }

    return (
        <>
            <input
                type='date'
                className={'light-primary-input mr-2' + (isInvalid ? ' invalid-input':'')}
                value={dateTime.date}
                onChange={(e) => onChangeDate(e.target.value)}
                onBlur={() => onBlurHandler()}
                disabled={disabled}
            />
            <input
                type='time'
                className={'light-primary-input' + (isInvalid && dateTime.date != '' && dateTime.time != ''  ? ' invalid-input':'')}
                value={dateTime.time}
                onChange={(e) => onChangeTime(e.target.value)}
                onBlur={() => onBlurHandler()}
                disabled={disabled}
            />
        </>
    )
}

const toTwoDigits = (num) => {
    let prefix = num > 9 ? '' : '0'
    return prefix + num
}

const dateToTime = (date, time) => {
    return new Date(date + ' ' + (time ?? '00:00')).getTime()
}


// Le cringe total 🥴🤘
const OPENING_DATE_FIELD = 'openingDate'
const ENDING_DATE_FIELD = 'endingDate'
const useHomeworkValidation = (homework) => {
    const [isTouched, setIsTouched] = useState(false)
    const [errors, setErrors] = useState({})
    const homeworkValidation = useBestValidation(homeworkValidationSchema)

    const blurHandle = (e) => {
        let fieldName = e.target.name
        resetError(fieldName)

        setIsTouched(true)
        termCheck(e)
        homeworkValidation.blurHandle(e)
        setErrors({...homeworkValidation.errors, ...errors})
    }

    const changeHandle = (e) => {
        let fieldName = e.target.name
        resetError(fieldName)

        if(isTouched) termCheck(e)
        homeworkValidation.changeHandle(e)
        setErrors({...homeworkValidation.errors, ...errors})
    }

    const termCheck = (e) => {
        let fieldName = e.target.name
        if ((fieldName === OPENING_DATE_FIELD || fieldName === ENDING_DATE_FIELD) && e.target.value != null) {
            
            if (fieldName === OPENING_DATE_FIELD) {
                resetError(ENDING_DATE_FIELD)
                if (e.target.value != null && homework[ENDING_DATE_FIELD] != null && e.target.value > homework[ENDING_DATE_FIELD]) {
                    addError(fieldName, homeworkValidationSchema[fieldName].invalidTerm[0])
                }
            } else if (fieldName === ENDING_DATE_FIELD) {
                resetError(OPENING_DATE_FIELD)
                if (e.target.value != null && homework[OPENING_DATE_FIELD] != null && homework[OPENING_DATE_FIELD] > e.target.value) {
                    addError(fieldName, homeworkValidationSchema[fieldName].invalidTerm[0])
                }
            }
        }
    }

    const addError = (fieldPath, error) => {
        let targetErrors = errors
        targetErrors[fieldPath] = error
        setErrors(targetErrors)
    }

    const resetError = (fieldPath) => {
        let targetErrors = errors
        delete targetErrors[fieldPath]
        setErrors(targetErrors)
    }

    const validate = () => {
        resetError(ENDING_DATE_FIELD)

        setIsTouched(true)
        if(homework.openingDate && homework.endingDate && homework.openingDate > homework.endingDate) {
            if(!errors[OPENING_DATE_FIELD]) addError(ENDING_DATE_FIELD, homeworkValidationSchema[ENDING_DATE_FIELD].invalidTerm)
        }

        let res = homeworkValidation.validate(homework)
        setErrors({...homeworkValidation.errors, ...errors})
        return res
    }

    const clearTouches = () => {
        setIsTouched(false)
        setErrors({})
    }
    
    return { 
        ...homeworkValidation,
        errors,
        blurHandle,
        changeHandle,
        validate,
        clearTouches,
    }
}

const makeTarget = (name, value) => {
    return { target: {name: name, value: value } }
}

export default HomeworkBuilderPanel
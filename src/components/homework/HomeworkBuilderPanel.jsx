import React, { useState, useContext, useEffect } from 'react'
import { Alert, Button, Row, Col, Badge, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import { IoSchoolOutline, IoChevronForwardOutline } from "react-icons/io5";

import useBestValidation, { NUMBER_TYPE, OBJECT_TYPE, ARRAY_TYPE } from '../tasks/edit/useBestValidation'
import { getTaskTypeColor } from '../tasks/TaskTypeDropdown'
import { HomeworkContext } from './HomeworkBuilderContext'
import FeedbackMessage from '../feedback/FeedbackMessage'
import SelectHomeworkModal from './SelectHomeworkModal'
import ProcessBar from '../process-bar/ProcessBar'
import GroupSelect from './filters/GroupSelect'
import './HomeworkBuilderPanel.less'
import { Modal } from 'react-bootstrap';
import CustomInput from '../common/CustomInput';

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
    const [homeworkModalShow, setHomeworkModalShow] = useState(false)
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

        homeworkValidation.reset()
        homework.setHomework(selectedHomework)
        setIsHomeworkSelectShow(false)
        setHomeworkModalShow(true)
    }

    const onAskHomeworkHandler = () => {
        if(!homeworkValidation.validate(homework.current)) {
            return
        }

        setHomeworkModalShow(false)
        homework.askHomework()
    }

    const onCancelHomeworkHandler = () => {
        setHomeworkModalShow(false)
        homework.setHomework(undefined)
    }

    return (
        <>
            <div className="homework-panel" onClick={homework.current ? () => setHomeworkModalShow(true) : () => setIsHomeworkSelectShow(true)}>
                <div className="d-flex flex-row">
                    <div className="budge-icon">
                        <IoSchoolOutline size={35} />
                    </div>
                    <div className="homework-middle">
                        <div><h4>Домашняя работа</h4></div>
                        {homework.current
                            ? <p><span className="mr-4">{`Класс: ${homework.current?.group?.name ?? "Не выбран"}`}</span><br/><span>{`Заданий: ${homework.current?.tasks?.length ?? 0}`}</span></p>
                            : <p>Объединяйте выбранные задания в домашнее и назначайте их выполнение студентам группы на определенный срок</p>
                        }
                    </div>
                </div>
                <div className="homework-action">
                    <span>{homework.current ? "" : "Начать"}</span><IoChevronForwardOutline size={26} />
                </div>
            </div>

            {homeworkModalShow && <Modal show={true} size="lg" onHide={() => setHomeworkModalShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Домашнее задание</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isFetching && (<ProcessBar height='.18Rem' className='position-absolute' />)}
                    <Row>
                        <Col md={6}>
                            <CustomInput 
                                label="Группа"
                                errorMessage={homeworkValidation.errors.group}
                            >
                                <GroupSelect
                                    placeholder='Выберите'
                                    variant="light"
                                    className="w-100"
                                    initialSelectedGroup={homework.current.group}
                                    onSelect={(group) => {
                                        homework.setGroup(group)
                                        homeworkValidation.blurHandle(makeTarget('group', group))
                                    }}
                                    disabled={isFetching}
                                />
                            </CustomInput>
                            <CustomInput 
                                label="Дата начала"
                                errorMessage={homeworkValidation.errors.openingDate}
                            >
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
                            </CustomInput>
                            <CustomInput 
                                label="Дата окончания"
                                errorMessage={homeworkValidation.errors.endingDate}
                            >
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
                            </CustomInput>
                        </Col>

                        <Col md={6} className='d-flex flex-column'>
                            <span className='font-size-14'>Задания:</span>
                            <ul className='homework-tasks-list mb-0'>
                                {homework.current.tasks &&
                                    homework.current.tasks.map((task) => {
                                        return (
                                            <li key={task.id} className='homework-task-item'>
                                                <div className='d-flex justify-content-between'>
                                                    <div className='d-flex align-items-center'>
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
                                                                                Позволяет назначить сроки заданию внутри сроков всего ДЗ. Подходит для
                                                                                поэтапного выполнения работы
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
                                        <h6 className="mt-4">Задания еще не добавлены</h6>
                                        <p className='text-muted font-size-14 mb-0'>
                                            Выберите задание из вашего списка в разделе, нажмите три точки по заданию и затем "Добавить в домашнее".
                                        </p>
                                    </div>
                                )}
                            </ul>
                            <div className='d-flex flex-row mt-auto'>
                                <FeedbackMessage message={homeworkValidation.errors.tasks} className='mt-3' />
                            </div>
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <div className='d-flex flex-row justify-content-between w-100'>
                        <Button variant="secondary" disabled={isFetching} onClick={() => onCancelHomeworkHandler()}>Отменить</Button>
                        <div>
                            <Button variant="secondary" disabled={isFetching} onClick={() => setHomeworkModalShow(false)} className="mr-2">Свернуть</Button>
                            <Button variant="primary" disabled={isFetching} onClick={() => onAskHomeworkHandler()}>Задать</Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>}

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
        <div className="datetime-input">
            <input
                type='date'
                className={'primary-input mr-2' + (isInvalid ? ' invalid-input':'')}
                value={dateTime.date}
                onChange={(e) => onChangeDate(e.target.value)}
                onBlur={() => onBlurHandler()}
                disabled={disabled}
            />
            <input
                type='time'
                className={'primary-input' + (isInvalid && dateTime.date != '' && dateTime.time != ''  ? ' invalid-input':'')}
                value={dateTime.time}
                onChange={(e) => onChangeTime(e.target.value)}
                onBlur={() => onBlurHandler()}
                disabled={disabled}
            />
        </div>
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

    useEffect(() => {
        setErrors({...homeworkValidation.errors, ...errors})
    }, [homeworkValidation.errors])

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

    const validate = (homework) => {
        resetError(ENDING_DATE_FIELD)

        setIsTouched(true)
        let termValid = true
        if(homework.openingDate && homework.endingDate && homework.openingDate > homework.endingDate) {
            termValid = false
            if(!errors[OPENING_DATE_FIELD]) addError(ENDING_DATE_FIELD, homeworkValidationSchema[ENDING_DATE_FIELD].invalidTerm)
        }

        let res = homeworkValidation.validate(homework)
        setErrors({...homeworkValidation.errors, ...errors})
        return res
    }

    const reset = () => {
        homeworkValidation.reset()
        setIsTouched(false)
        setErrors({})
    }
    
    return { 
        ...homeworkValidation,
        errors,
        blurHandle,
        changeHandle,
        validate,
        reset,
    }
}

const makeTarget = (name, value) => {
    return { target: {name: name, value: value } }
}

export default HomeworkBuilderPanel
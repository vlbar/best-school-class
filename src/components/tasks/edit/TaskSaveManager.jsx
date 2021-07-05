import React, { useState, useLayoutEffect, useRef, useEffect, useContext } from 'react'
import { Button, Container, Row, Col, Dropdown, ButtonGroup } from 'react-bootstrap'
import './TaskEditor.less'

const SAVING_STATUS = 'Сохранение...'
export const SAVED_STATUS = 'Сохранено'
export const ERROR_STATUS = 'Произошла ошибка'
export const VALIDATE_ERROR_STATUS = 'Исправьте ошибки!'

export const TaskSaveContext = React.createContext()

export const TaskSaveManager = ({children}) => {
    const [isBarShow, setIsBarShow] = useState(false)
    const [saveStatus, setSaveStatus] = useState(SAVED_STATUS)
    const [displayStatus, setDisplayStatus] = useState('')
    const [taskName, setTaskName] = useState('')

    const [updateCycle, setUpdateCycle] = useState(0)
    const subscribers = useRef([])
    const checkedSubs = useRef(0)

    const addSubscriber = (id) => {
        subscribers.current.push(id)
    }

    const removeSubscriber = (id) => {
        let removedSubIndex = subscribers.current.indexOf(id)
        subscribers.current.splice(removedSubIndex, 1)
    }

    const onSaveClick = () => {
        setSaveStatus(SAVING_STATUS)
        setUpdateCycle(updateCycle + 1)
    }

    const statusBySub = (status) => {
        switch(status) {
            case VALIDATE_ERROR_STATUS:
            case ERROR_STATUS:
                setSaveStatus(status)
                break
            case SAVED_STATUS:
                checkedSubs.current++
                if(saveStatus !== ERROR_STATUS && checkedSubs.current == subscribers.current.length) {
                    setSaveStatus(SAVED_STATUS)
                    checkedSubs.current = 0
                }
                break
        }
    }

    //bar show
    const listener = (e) => {
        setIsBarShow(window.scrollY >= 100)
    }

    useLayoutEffect(() => {
        window.addEventListener('scroll', listener);
        return () => {
            window.removeEventListener('scroll', listener);
        };
    })

    const savedTimer = useRef(null)
    useEffect(() => {
        let additionalClassName = ''
        if(saveStatus !== SAVED_STATUS) clearTimeout(savedTimer.current)
        switch(saveStatus) {
            case SAVED_STATUS:
                savedTimer.current = setTimeout(() => {
                    if(saveStatus == SAVED_STATUS) setDisplayStatus(<span className='trans-span hide'>{saveStatus}</span>)
                }, 2000);
                break
            case SAVING_STATUS:
                break
            case ERROR_STATUS:
                additionalClassName = 'text-danger'
                break
            case VALIDATE_ERROR_STATUS:
                additionalClassName = 'text-danger'
        }
        setDisplayStatus(<span className={`trans-span ${additionalClassName}`}>{saveStatus}</span>)
    }, [saveStatus])

    return (
        <TaskSaveContext.Provider value={{displayStatus, setTaskName, addSubscriber, removeSubscriber, updateCycle, onSaveClick, statusBySub}}>
            <div className={'task-save-panel' + (isBarShow ? ' show':'')}>
                <Container>
                    <Row>
                        <Col md={8} className='d-flex mt-2'>
                            <h4>Задание</h4>
                            <span className='label-center text-ellipsis ml-2'>
                                {taskName}
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
                                    <Dropdown.Item>Завершить</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Container>
            </div>
            {children}
        </TaskSaveContext.Provider>
    )
}

export function useTaskSaveManager(onSave) {
    const { addSubscriber, removeSubscriber, updateCycle, statusBySub } = useContext(TaskSaveContext)

    useEffect(() => {
        let uid = Math.random()
        addSubscriber(uid)
        return () => removeSubscriber(uid)
    }, [])
    
    const firstCycle = useRef(true)
    useEffect(() => {
        if(!firstCycle.current) {
            onSave()
        }
        firstCycle.current = false
    }, [updateCycle])

    return statusBySub
}
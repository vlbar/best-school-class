import React, { useState, useLayoutEffect, useRef, useEffect } from 'react'
import { Button, Container, Row, Col, Dropdown, ButtonGroup } from 'react-bootstrap'
import './TaskEditor.less'

const SAVING_STATUS = 'Сохранение...'
export const SAVED_STATUS = 'Сохранено'
export const ERROR_STATUS = 'Произошла ошибка'

export const TaskSaveContext = React.createContext()

export const TaskSaveManager = ({children}) => {
    const [isBarShow, setIsBarShow] = useState(false)
    const [saveStatus, setSaveStatus] = useState(SAVED_STATUS)
    const [displayStatus, setDisplayStatus] = useState('')
    const [taskName, setTaskName] = useState('')

    const subscribers = useRef([])
    const checkedSubs = useRef(0)

    const addSubscriber = (subscriber) => {
        subscribers.current.push(subscriber)
    }

    const onSaveClick = () => {
        setSaveStatus(SAVING_STATUS)
        subscribers.current.forEach(sub => sub.call())
    }

    const statusBySub = (status) => {
        switch(status) {
            case ERROR_STATUS:
                setSaveStatus(ERROR_STATUS)
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
        switch(saveStatus) {
            case SAVED_STATUS:
                savedTimer.current = setTimeout(() => {
                    if(saveStatus == SAVED_STATUS) setDisplayStatus(<span className='trans-span hide'>{saveStatus}</span>)
                }, 2000);
                break
            case SAVING_STATUS:
                clearTimeout(savedTimer.current)
                break
            case ERROR_STATUS:
                clearTimeout(savedTimer.current)
                additionalClassName = 'text-danger'
                break
        }
        setDisplayStatus(<span className={`trans-span ${additionalClassName}`}>{saveStatus}</span>)
    }, [saveStatus])

    return (
        <TaskSaveContext.Provider value={{displayStatus, setTaskName, addSubscriber, onSaveClick, statusBySub}}>
            <div className={'task-save-panel' + (isBarShow ? ' show':'')}>
                <Container>
                    <Row>
                        <Col md={8} className='d-flex mt-2'>
                            <h4>Задание</h4>
                            <span className='label-center ml-2'>
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
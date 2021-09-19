import React, { useState, useLayoutEffect, useRef, useEffect, useContext } from 'react'
import { Button, Container, Row, Col, Dropdown, ButtonGroup } from 'react-bootstrap'
import { Prompt } from 'react-router'
import './TaskEditor.less'

const SAVING_STATUS = 'Сохранение...'
export const SAVED_STATUS = 'Сохранено'
export const ERROR_STATUS = 'Произошла ошибка'
export const VALIDATE_ERROR_STATUS = 'Исправьте ошибки!'

export const TaskSaveContext = React.createContext()

export const TaskSaveManager = ({children, autoSaveDelay = 30000}) => {
    const [isBarShow, setIsBarShow] = useState(false)
    const [isHasChanges, setIsHasChanges] = useState(false)
    const [saveStatus, setSaveStatus] = useState(SAVED_STATUS)
    const [displayStatus, setDisplayStatus] = useState('')
    const [taskName, setTaskName] = useState('')

    const [updateCycle, setUpdateCycle] = useState(0)
    const subscribers = useRef([])
    const checkedSubs = useRef(0)
    const changedSubs = useRef([])

    const autoSaveTimer = useRef(undefined)
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true)

    // subscribers
    const addSubscriber = (id) => {
        subscribers.current.push(id)
    }

    const removeSubscriber = (id) => {
        let removedSubIndex = subscribers.current.indexOf(id)
        subscribers.current.splice(removedSubIndex, 1)
    }

    // save
    let generalSaveStatus = SAVING_STATUS
    const canSave = useRef(true)
    const isFakeSaving = useRef(false)
    const expectedSubResponses = useRef(undefined)
    const onSaveClick = () => {
        setUpdateCycle(updateCycle + 1)

        /*if(canSave.current) {
            canSave.current = false
            autoSaveTimer.current = undefined
            expectedSubResponses.current = subscribers.current.length

            changedSubs.current = []
            setIsHasChanges(false)

            setUpdateCycle(updateCycle + 1)
        } else {
            if(saveStatus !== SAVING_STATUS) isFakeSaving.current = true
        }

        setSaveStatus(SAVING_STATUS)
        generalSaveStatus = SAVING_STATUS*/
    }

    // changes
    const setIsSubHaveChanges = (id, isChanged) => {
        let changedSubList = changedSubs.current
        let index = changedSubList.indexOf(id)

        if(isChanged) {
            if(index < 0) changedSubList.push(id)
        } else
            if(index >= 0) changedSubList.splice(index, 1)

        changedSubs.current = changedSubList
        setIsHasChanges(changedSubList.length !== 0)
    }

    useEffect(() => {
        if(isHasChanges) {
            window.onbeforeunload = (ev) => {
                ev.preventDefault()
                return ev.returnValue = 'Есть несохраненные изменения, вы уверены, что хотите закрыть редактор задания?';
            }

            if(isAutoSaveEnabled) {
                autoSaveTimer.current = setTimeout(() => {
                    canSave.current = true
                    onSaveClick()
                }, autoSaveDelay)
            }
        } else {
            window.onbeforeunload = undefined
        }
    }, [isHasChanges])
    
    // status chages
    const statusBySub = (status) => {
        if(status === VALIDATE_ERROR_STATUS && generalSaveStatus === SAVING_STATUS) {
            generalSaveStatus = VALIDATE_ERROR_STATUS
        } else if(status === ERROR_STATUS) {
            generalSaveStatus = ERROR_STATUS
        }

        checkedSubs.current++
        if(checkedSubs.current == expectedSubResponses.current) {
            if(generalSaveStatus === SAVING_STATUS) generalSaveStatus = SAVED_STATUS
            setSaveStatus(generalSaveStatus)

            checkedSubs.current = 0
            manualSaveCooldown()
        }
    }

    function manualSaveCooldown() {
        setTimeout(() => {
            canSave.current = true
            if(isFakeSaving.current) {
                isFakeSaving.current = false
                onSaveClick()
            }
        }, 10000)
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

    // auto save
    useEffect(() => {
        if(isAutoSaveEnabled) {
            setIsAutoSaveEnabled(true)
        } else {
            autoSaveTimer.current = undefined
            setIsAutoSaveEnabled(false)
        }
    }, [isAutoSaveEnabled])

    return (
        <>
            <div className={'task-save-panel' + (isBarShow ? ' show':'')}>
                <Prompt
                    when={isHasChanges}
                    message='Есть несохраненные изменения, вы уверены, что хотите закрыть редактор задания?'
                />
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
                                    <Dropdown.Item onClick={() => setIsAutoSaveEnabled(!isAutoSaveEnabled)}>{(isAutoSaveEnabled) && <i className='fas fa-check'></i>} Автосохранение</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Container>
            </div>
            <TaskSaveContext.Provider value={{addSubscriber, removeSubscriber, updateCycle, onSaveClick, statusBySub, setIsSubHaveChanges, displayStatus, 
                taskDisplay: { taskName, setTaskName },
                autoSave:    { isEnabled: isAutoSaveEnabled, setIsAutoSaveEnabled }
            }}>
                {children}
            </TaskSaveContext.Provider>
        </>
    )
}

export function useTaskSaveManager(onSave) {
    const { addSubscriber, removeSubscriber, updateCycle, statusBySub, setIsSubHaveChanges } = useContext(TaskSaveContext)
    const uid = useRef(undefined)

    useEffect(() => {
        let id = Math.random()
        uid.current = id
        addSubscriber(id)
        return () => removeSubscriber(id)
    }, [])
    
    const firstCycle = useRef(true)
    useEffect(() => {
        if(!firstCycle.current) {
            onSave()
        }
        firstCycle.current = false
    }, [updateCycle])

    function setIsChanged(flag) {
        setIsSubHaveChanges(uid.current, flag)
    }

    return { statusBySub, setIsChanged }
}

export function isEquivalent(a, b) {
    if(b == undefined) return false
    let aProps = Object.getOwnPropertyNames(a)
    let bProps = Object.getOwnPropertyNames(b)

    if (aProps.length != bProps.length) {
        return false
    }

    for (var i = 0; i < aProps.length; i++) {
        let propName = aProps[i]
        if(a[propName] instanceof Array) {
            if(a[propName].length !== b[propName].length)
                return false
            
            for(let j = 0; j < a[propName].length; j++) {              
                if(a[propName][j] instanceof Object) {
                    if(!isEquivalent(a[propName][j], b[propName][j]))
                        return false
                } else {
                    if(a[propName][j] !== b[propName][j])
                        return false
                }
            }
        } else {
            if (a[propName] !== b[propName])
                return false  
        }    
    }

    return true
}
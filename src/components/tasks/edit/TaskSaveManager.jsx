import React, { useState, useRef, useEffect, useContext } from 'react'
import { Prompt } from 'react-router'
import './TaskEditor.less'

const SAVING_STATUS = 'Сохранение...'
export const SAVED_STATUS = 'Сохранено'
export const ERROR_STATUS = 'Произошла ошибка'
export const VALIDATE_ERROR_STATUS = 'Исправьте ошибки!'

export const TaskSaveContext = React.createContext()

export const TaskSaveManager = ({children, autoSaveDelay = 20000}) => {
    const [isHasChanges, setIsHasChanges] = useState(false)
    const [saveStatus, setSaveStatus] = useState(SAVED_STATUS)
    const [displayStatus, setDisplayStatus] = useState('')

    const [updateCycle, setUpdateCycle] = useState(0)
    const subscribers = useRef([])
    const checkedSubs = useRef([])
    const changedSubs = useRef([])
    const expectedSubResponses = useRef([])

    const autoSaveTimer = useRef(undefined)
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true)

    useEffect(() => {
        return () => {
            StopAutopSaveTimer()
        }
    }, [])

    // subscribers
    const addSubscriber = (id) => {
        subscribers.current.push(id)
    }

    const removeSubscriber = (id) => {
        setIsSubHaveChanges(id, false)
        checkedSubs.current = checkedSubs.current.filter(x => x.id !== id)
        expectedSubResponses.current = expectedSubResponses.current.filter(x => x.id !== id)
        subscribers.current = subscribers.current.filter(x => x !== id)
        CheckIsAllSubsResponse()
    }

    // save
    let generalSaveStatus = SAVING_STATUS
    const canSave = useRef(true)
    const isFakeSaving = useRef(false)  
    const startSave = () => {
        if(canSave.current) {
            canSave.current = false
            expectedSubResponses.current = subscribers.current
            changedSubs.current = []

            setIsSubsNeedSave(false)
            setUpdateCycle(updateCycle + 1)
        } else {
            if(saveStatus !== SAVING_STATUS) isFakeSaving.current = true
        }

        setSaveStatus(SAVING_STATUS)
        generalSaveStatus = SAVING_STATUS
    }

    const StartAutoSaveTimer = () => {
        if (isAutoSaveEnabled) {
            clearTimeout(autoSaveTimer.current)
            autoSaveTimer.current = setTimeout(() => {
                canSave.current = true
                startSave()
            }, autoSaveDelay)
        }
    }

    const StopAutopSaveTimer = () => {
        clearTimeout(autoSaveTimer.current)
    }

    // changes
    const setIsSubHaveChanges = (id, isChanged) => {
        let changedSubList = changedSubs.current
        let isInclude = changedSubList.includes(id)

        if (isChanged) {
            if (!isInclude) changedSubList.push(id)
        } else if (isInclude) changedSubList = changedSubList.filter(x => x !== id)

        changedSubs.current = changedSubList
        setIsSubsNeedSave(changedSubList.length !== 0)
    }

   const setIsSubsNeedSave = (isNeed) => {
        setIsHasChanges(isNeed)
       
        if (isNeed) {
            window.onbeforeunload = (ev) => {
                ev.preventDefault()
                return ev.returnValue = 'Есть несохраненные изменения, вы уверены, что хотите закрыть редактор задания?';
            }

            StartAutoSaveTimer()
        } else {
            window.onbeforeunload = undefined
        }
   }
    
    // status chages
    const statusBySub = (uid, status) => {
        if(!expectedSubResponses.current.includes(uid) || checkedSubs.current.includes(uid)) return
        if(status === VALIDATE_ERROR_STATUS && generalSaveStatus === SAVING_STATUS) {
            generalSaveStatus = VALIDATE_ERROR_STATUS
        } else if(status === ERROR_STATUS) {
            generalSaveStatus = ERROR_STATUS
        }

        checkedSubs.current.push(uid)
        CheckIsAllSubsResponse()
    }

    const CheckIsAllSubsResponse = () => {
        if(checkedSubs.current.length == expectedSubResponses.current.length) {
            if(generalSaveStatus === SAVING_STATUS) generalSaveStatus = SAVED_STATUS
            setSaveStatus(generalSaveStatus)

            expectedSubResponses.current = []
            checkedSubs.current = []
            manualSaveCooldown()
            StartAutoSaveTimer()
        }
    }

    function manualSaveCooldown() {
        setTimeout(() => {
            canSave.current = true
            if(isFakeSaving.current) {
                isFakeSaving.current = false
                startSave()
            }
        }, 5000)
    }

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
            StartAutoSaveTimer()
        } else {
            StopAutopSaveTimer()
            setIsAutoSaveEnabled(false)
        }
    }, [isAutoSaveEnabled])

    return (
        <>
            <Prompt
                when={isHasChanges}
                message='Есть несохраненные изменения, вы уверены, что хотите закрыть редактор задания?'
            />
            <TaskSaveContext.Provider value={{addSubscriber, removeSubscriber, updateCycle, onSaveClick: startSave, statusBySub, setIsSubHaveChanges, displayStatus,
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

    function callbackSubStatus(status) {
        statusBySub(uid.current, status)
    }

    return { callbackSubStatus, setIsChanged }
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
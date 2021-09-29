import React, { useState, useRef, useEffect, useContext } from 'react'

export const ContextFunction = React.createContext()

export const ContextFunctionProvider = ({ onAllSubsReplied, callback, children }) => {
    const [updateCycle, setUpdateCycle] = useState(0)
    const subscribers = useRef([])
    const calledSubs = useRef(0)

    const onAllSubsRepliedRef = useRef(onAllSubsReplied)
    const callbackRef = useRef(callback)

    const addSubscriber = id => {
        subscribers.current.push(id)
    }

    const removeSubscriber = id => {
        let removedSubIndex = subscribers.current.indexOf(id)
        subscribers.current.splice(removedSubIndex, 1)
    }

    function callbackHandler() {
        if(callbackRef.current) callbackRef.current(arguments)
        calledSubs.current++

        if (onAllSubsRepliedRef.current) {
            if (calledSubs.current >= subscribers.current.length) {
                onAllSubsRepliedRef.current()
            }
        }
    }

    const setOnAllSubsReplied = (func) => {
        onAllSubsRepliedRef.current = func
    }

    const setCallback = (func) => {
        callbackRef.current = func
    }

    const callUpdateCycle = () => {
        setUpdateCycle(updateCycle + 1)
    }

    return (
        <ContextFunction.Provider
            value={{ addSubscriber, removeSubscriber, subscribers, calledSubs, updateCycle, callUpdateCycle, callbackHandler, setOnAllSubsReplied, setCallback }}>
            {children}
        </ContextFunction.Provider>
    )
}

export function useContextFunctionSettings(callback, onAllSubsReplied) {
    const { setOnAllSubsReplied, setCallback } = useContext(ContextFunction)

    useEffect(() => {
        setOnAllSubsReplied(onAllSubsReplied)
        setCallback(callback)
    }, [])
}

export function useContextFunctionSubs() {
    const { subscribers, calledSubs } = useContext(ContextFunction)
    return { subscribers: subscribers.current, calledSubs: calledSubs.current }
}

export function useContextFunctionTrigger() {
    const { callUpdateCycle } = useContext(ContextFunction)
    return callUpdateCycle
}

export function useContextFunction(onCall) {
    const { addSubscriber, removeSubscriber, updateCycle, callbackHandler } = useContext(ContextFunction)
    const uid = useRef(undefined)

    useEffect(() => {
        let id = Math.random()
        uid.current = id
        addSubscriber(id)
        return () => removeSubscriber(id)
    }, [])

    const firstCycle = useRef(true)
    useEffect(() => {
        if (!firstCycle.current) {
            onCall()
        }
        firstCycle.current = false
    }, [updateCycle])

    return callbackHandler
}


// requirements: updateCycle in context value
export function useContextUpdateCycles() {
    const [updateCycle, setUpdateCycle] = useState(0)
    
    const updateCycleHandler = () => {
        setUpdateCycle(updateCycle + 1)
    }

    return [updateCycle, updateCycleHandler]
}

export function useContextUpdateCyclesSlave(contextValue, callback) {
    const { updateCycle } = useContext(contextValue)

    const firstCycle = useRef(true)
    useEffect(() => {
        if (!firstCycle.current) {
            if(callback) callback()
        }
        firstCycle.current = false
    }, [updateCycle])
}

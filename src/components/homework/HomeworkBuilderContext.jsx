import React, { useReducer } from 'react'
import { addInfoNotification } from '../notifications/notifications'

//flux
const SET = 'SET'
const OPENING_DATE = 'OPENING_DATE'
const ENDING_DATE = 'ENDING_DATE'
const GROUP = 'GROUP'
const ADD_TASK = 'ADD_TASK'
const REMOVE_TASK = 'REMOVE_TASK'
const TASK_OPENING_DATE = 'TASK_OPENING_DATE'
const TASK_ENDING_DATE = 'TASK_ENDING_DATE'

const homeworkReducer = (state, action) => {
    switch (action.type) {
        case SET:
            if (action.payload == undefined) return undefined
            state = action.payload
            return { ...state }
        case OPENING_DATE:
            return { ...state, openingDate: action.payload }
        case ENDING_DATE:
            return { ...state, endingDate: action.payload }
        case GROUP:
            return { ...state, group: action.payload }
        case ADD_TASK:
            return { ...state, tasks: [...(state.tasks ?? []), action.payload] }
        case REMOVE_TASK:
            return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) }
        default:
            return state
    }
}

export const HomeworkContext = React.createContext()

const HomeworkBuilderContext = ({ children }) => {
    const [targetHomework, dispatchHomework] = useReducer(homeworkReducer, undefined)

    // actions
    const setHomework = (homework) => dispatchHomework({ type: SET, payload: homework })
    const setOpeningDate = (openingDate) => dispatchHomework({ type: OPENING_DATE, payload: openingDate })
    const setEndingDate = (endingDate) => dispatchHomework({ type: ENDING_DATE, payload: endingDate })
    const setGroup = (group) => dispatchHomework({ type: GROUP, payload: group })

    const addTask = (task) => {
        if (targetHomework == undefined) {
            setHomework({
                tasks: [task],
            })
            return
        }

        let targetTasks = targetHomework.tasks ?? []
        if (targetTasks.find((x) => x.id == task.id) != null) {
            addInfoNotification(`Задание "${task.name}" уже добавлено в домашнее`)
            return
        }

        dispatchHomework({ type: ADD_TASK, payload: task })
    }

    const removeTask = (taskId) => dispatchHomework({ type: REMOVE_TASK, payload: taskId })

    // context
    let homework = {
        current: targetHomework,
        setHomework,
        setOpeningDate,
        setEndingDate,
        setGroup,
        addTask,
        removeTask,
    }

    return <HomeworkContext.Provider value={{ homework }}>{children}</HomeworkContext.Provider>
}

export default HomeworkBuilderContext

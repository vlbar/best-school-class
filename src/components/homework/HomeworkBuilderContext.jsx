import React, { useReducer, useState } from 'react'
import axios from 'axios'

import { addInfoNotification, addErrorNotification } from '../notifications/notifications'


const MAX_TASKS_IN_HOMEWORK = 10

//flux
const SET = 'SET'
const OPENING_DATE = 'OPENING_DATE'
const ENDING_DATE = 'ENDING_DATE'
const GROUP = 'GROUP'
const ADD_TASK = 'ADD_TASK'
const ADD_TASKS = 'ADD_TASKS'
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
        case ADD_TASKS:
            return { ...state, tasks: [...(state.tasks ?? []), ...action.payload] }
        case REMOVE_TASK:
            return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) }
        default:
            return state
    }
}

// requests
const baseUrl = '/homeworks'

async function add(homework) {
    return axios.post(`${baseUrl}`, homework)
}

async function update(homework) {
    return axios.put(`${baseUrl}/${homework.id}`, homework)
}

export const HomeworkContext = React.createContext()

const HomeworkBuilderContext = ({ children }) => {
    const [targetHomework, dispatchHomework] = useReducer(homeworkReducer, undefined)
    const [isFetching, setIsFetching] = useState(false)

    // actions
    const setHomework = (homework) => dispatchHomework({ type: SET, payload: homework })
    const setOpeningDate = (openingDate) => dispatchHomework({ type: OPENING_DATE, payload: openingDate })
    const setEndingDate = (endingDate) => dispatchHomework({ type: ENDING_DATE, payload: endingDate })
    const setGroup = (group) => dispatchHomework({ type: GROUP, payload: group })

    const addTask = (task) => {
        createHomeworkIfNotExists()

        if (isFetching) {
            addInfoNotification('Домашнее задание ещё сохраняется, подождите...')
            return
        }

        let targetTasks = targetHomework?.tasks ?? []
        if (targetTasks.find((x) => x.id == task.id) != null) {
            addInfoNotification(`Задание "${task.name}" уже добавлено в домашнее`)
            return
        }

        if (targetHomework?.tasks?.length >= MAX_TASKS_IN_HOMEWORK) {
            addInfoNotification(`В одно домашнее задание можно добавить максимум только ${MAX_TASKS_IN_HOMEWORK} заданий!`)
            return
        }

        dispatchHomework({ type: ADD_TASK, payload: task })
    }

    const addTasks = (tasks) => {
        createHomeworkIfNotExists()
        let targetTasks = targetHomework?.tasks ?? []
        tasks = tasks.filter((task) => {
            let taskToAdd = targetTasks.find((x) => x.id == task.id)
            if (taskToAdd !== undefined) {
                addInfoNotification(`Задание "${task.name}" уже добавлено в домашнее`)
                return false
            } else return true
        })

        let currentTaskCount = targetHomework ? targetHomework.tasks.length : 0
        if (tasks.length + currentTaskCount > MAX_TASKS_IN_HOMEWORK) {
            tasks.splice(MAX_TASKS_IN_HOMEWORK - currentTaskCount)
            addInfoNotification(`В одно домашнее задание можно добавить максимум только ${MAX_TASKS_IN_HOMEWORK} заданий!`)
        }

        dispatchHomework({ type: ADD_TASKS, payload: tasks })
    }

    const removeTask = (taskId) => dispatchHomework({ type: REMOVE_TASK, payload: taskId })

    // homework asking
    const askHomework = () => {
        setIsFetching(true)
        let homeworkDTO = toHomeworkDTO(targetHomework)

        if (homeworkDTO.id)
            update(homeworkDTO)
                .then((res) => setHomework(undefined))
                .catch((error) => addErrorNotification('Не удалось обновить домашнее задание, возможно, изменения не сохранятся. \n' + error))
                .finally(() => setIsFetching(false))
        else
            add(homeworkDTO)
                .then((res) => setHomework(undefined))
                .catch((error) => addErrorNotification('Не удалось добавить домашнее задание, возможно, изменения не сохранятся. \n' + error))
                .finally(() => setIsFetching(false))
    }

    // context
    let homework = {
        current: targetHomework,
        isFetching,
        setHomework,
        setOpeningDate,
        setEndingDate,
        setGroup,
        addTask,
        addTasks,
        removeTask,
        askHomework,
    }

    // utils
    const createHomeworkIfNotExists = (task = undefined) => {
        if (targetHomework == undefined) {
            setHomework({
                tasks: task ? [task] : [],
            })
            return
        }
    }

    const toHomeworkDTO = (homework) => {
        return {
            id: homework.id,
            groupId: homework.group.id,
            openingDate: homework.openingDate,
            endingDate: homework.endingDate,
            taskIds: homework.tasks.map((x) => x.id),
        }
    }

    return <HomeworkContext.Provider value={{ homework }}>{children}</HomeworkContext.Provider>
}

export default HomeworkBuilderContext

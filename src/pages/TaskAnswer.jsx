import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Container } from 'react-bootstrap'
import { useParams } from 'react-router-dom'

import { addErrorNotification } from '../components/notifications/notifications'
import ConfirmStartTask from '../components/tasks/execute/ConfirmStartTask'
import TaskDetails from '../components/tasks/execute/TaskDetails'
import usePageTitle from '../components/feedback/usePageTitle'

export const tasksBaseUrl = '/tasks'

async function fetchTaskDetails(taskId) {
    return axios.get(`${tasksBaseUrl}/${taskId}`)
}

function TaskAnswer() {
    const [isFetching, setIsFetching] = useState(false)
    const { homeworkId, taskId } = useParams()
    const [task, setTask] = useState(undefined)

    usePageTitle({ title: task?.name })

    useEffect(() => {
        fetchTask()
    }, [])

    const fetchTask = () => {
        setIsFetching(true)

        fetchTaskDetails(taskId)
            .then(res => {
                let fetchedData = res.data
                setTask(fetchedData)
                setTaskCallback(fetchedData)
            })
            .catch(error => addErrorNotification('Не удалось загрузить информацию о задании. \n' + error.message))
            .finally(() => setIsFetching(false))
    }

    return (
        <>
            <Container>
                <TaskDetails task={task} isFetching={isFetching} />
                <ConfirmStartTask task={task} />
            </Container>
        </>
    )
}

export default TaskAnswer

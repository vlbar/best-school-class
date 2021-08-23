import React, { useEffect, useState } from 'react'
import axios from 'axios'

import { addErrorNotification } from '../../notifications/notifications'
import ConfirmStartTask from './ConfirmStartTask'
import ProcessBar from '../../process-bar/ProcessBar'
import { tasksBaseUrl } from '../../../pages/TaskAnswer'
import QuestionAnswerList from './question-answer/QuestionAnswerList'

export const answersPartUrl = 'answers'

async function fetchAnswer(taskId, role) {
    return axios.get(`${tasksBaseUrl}/${taskId}/${answersPartUrl}?size=1&r=${role[0]}`)
}

async function createAnswer(taskId, role) {
    return axios.post(`${tasksBaseUrl}/${taskId}/${answersPartUrl}?r=${role[0]}`)
}

const AnswerContext = ({ task, role = 'student' }) => {
    const [isFetching, setIsFetching] = useState(false)
    const [answers, setAnswers] = useState(undefined)
    const [isConfirmed, setIsConfirmed] = useState(undefined)

    useEffect(() => {
        if (!answers) fetchTaskAnswer()
    }, [])

    const fetchTaskAnswer = () => {
        setIsFetching(true)

        fetchAnswer(task.id, role)
            .then(res => {
                let fetchedData = res.data
                setAnswers(fetchedData.items)
                setIsConfirmed(fetchedData.items.length > 0)
            })
            .catch(error => addErrorNotification('Не удалось загрузить ответ на задание. \n' + error))
            .finally(() => setIsFetching(false))
    }

    const createTaskAnswer = () => {
        setIsConfirmed(true)
        setIsFetching(true)

        createAnswer(task.id, role)
            .then(res => {
                let fetchedData = res.data
                setAnswers([...answers, fetchedData])
            })
            .catch(error => addErrorNotification('Не удалось создать ответ на задание. \n' + error))
            .finally(() => setIsFetching(false))
    }

    return (
        <>
            {isFetching && <ProcessBar height='.18Rem' className='mt-2' />}
            <h5 className='mb-4'>Вопросы:</h5>
            {isConfirmed === false && <ConfirmStartTask task={task} onConfirm={() => createTaskAnswer()} />}
            {isConfirmed && answers[0] && (<QuestionAnswerList answerId={answers[0].id} />)}
        </>
    )
}

export default AnswerContext

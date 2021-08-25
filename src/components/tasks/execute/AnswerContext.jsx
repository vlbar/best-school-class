import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Button } from 'react-bootstrap'

import { addErrorNotification } from '../../notifications/notifications'
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
    const [selectedAnswerTry, setSelectedAnswerTry] = useState(undefined)
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
                setSelectedAnswerTry(fetchedData.items[0])
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
                setSelectedAnswerTry(fetchedData)
            })
            .catch(error => addErrorNotification('Не удалось создать ответ на задание. \n' + error))
            .finally(() => setIsFetching(false))
    }

    return (
        <>
            <h5 className='mb-4'>Вопросы:</h5>
            {isConfirmed === false && (
                <div className='text-center'>
                    <div className='mx-auto mb-3'>
                        <b>Вопросы еще не получены, так как выполнение задания еще не начато.</b>
                        <br />
                        Вы можете ознакомится с условиями задания и начать его выполнение.
                    </div>
                    <Button variant='outline-primary' type='submit' onClick={() => createTaskAnswer()}>
                        Начать выполнение
                    </Button>
                </div>
            )}
            {isFetching && <ProcessBar height='.18Rem' className='mt-2' />}
            {isConfirmed && selectedAnswerTry && (<QuestionAnswerList answerId={selectedAnswerTry.id} />)}
        </>
    )
}

export default AnswerContext

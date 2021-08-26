import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Button, ProgressBar } from 'react-bootstrap'

import { addErrorNotification } from '../../notifications/notifications'
import ProcessBar from '../../process-bar/ProcessBar'
import QuestionAnswerList from './question-answer/QuestionAnswerList'
import { tasksBaseUrl } from '../../../pages/TaskAnswer'
import { toLocaleTimeDurationString } from '../../common/LocaleTimeString'

export const answersPartUrl = 'answers'

async function fetchAnswer(taskId, role) {
    return axios.get(`${tasksBaseUrl}/${taskId}/${answersPartUrl}?size=1&r=${role[0]}`)
}

async function createAnswer(taskId, role) {
    return axios.post(`${tasksBaseUrl}/${taskId}/${answersPartUrl}?r=${role[0]}`)
}

const TaskAnswerTry = ({ task, role = 'student' }) => {
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

    // timer
    const timeLeftInterval = useRef(undefined)
    const [secondsLeft, setSecondsLeft] = useState(undefined)
    useEffect(() => {
        if (selectedAnswerTry && !timeLeftInterval.current) {
            setCurrentProgress(selectedAnswerTry.answeredQuestionCount)
            setSecondsLeft((selectedAnswerTry.startDate + task.duration * 60 * 1000 - new Date()) / 1000)
            timeLeftInterval.current = setInterval(() => {
                setSecondsLeft((selectedAnswerTry.startDate + task.duration * 60 * 1000 - new Date()) / 1000)
            }, 30000)
        }
    }, [selectedAnswerTry])

    useEffect(() => {
        return () => {
            clearInterval(timeLeftInterval.current)
        }
    }, [])

    // progress
    const [currentProgress, setCurrentProgress] = useState(undefined)

    const addProgress = (count = 1) => {
        setCurrentProgress(currentProgress + count)
    }

    const removeProgress = (count = 1) => {
        setCurrentProgress(currentProgress - count)
    }

    return (
        <>
            <h5 className='mb-1'>Вопросы:</h5>
            {isConfirmed && selectedAnswerTry && (
                <>
                    <div className='d-flex justify-content-between mb-2'>
                        <div className='my-auto'>Оставшееся время: {toLocaleTimeDurationString(secondsLeft)}</div>
                        <div>
                            <Button variant='outline-primary' size='sm' onClick={() => {}}>
                                Завершить
                            </Button>
                        </div>
                    </div>
                    <ProgressBar max={selectedAnswerTry.questionCount} now={currentProgress} className='mb-2' />
                </>
            )}

            {isFetching && <ProcessBar height='.18Rem' className='mt-2' />}
            {isConfirmed === false && (
                <div className='text-center'>
                    <div className='mx-auto mb-3'>
                        <b>Вопросы еще не получены, так как выполнение задания еще не начато.</b>
                        <br />
                        Вы можете ознакомится с условиями задания и начать его выполнение.
                    </div>
                    <Button variant='outline-primary' type='submit' onClick={() => createTaskAnswer(true)}>
                        Начать выполнение
                    </Button>
                </div>
            )}
            {isConfirmed && selectedAnswerTry && <QuestionAnswerList answerId={selectedAnswerTry.id} progress={{add: addProgress, remove: removeProgress}} />}
        </>
    )
}

export default TaskAnswerTry

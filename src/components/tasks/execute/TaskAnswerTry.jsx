import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Button, Modal, ProgressBar } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

import { addErrorNotification } from '../../notifications/notifications'
import AnimateHeight from 'react-animate-height'
import ProcessBar from '../../process-bar/ProcessBar'
import QuestionAnswerList from './question-answer/QuestionAnswerList'
import { tasksBaseUrl } from '../../../pages/TaskAnswer'
import { toLocaleTimeDurationString } from '../../common/LocaleTimeString'
import './TaskAnswerTry.less'

const STATUS_NOT_PERMITTED = 'NOT_PERFORMED'
const STATUS_PERFORMED = 'PERFORMED'
const STATUS_APPRECIATED = 'APPRECIATED'

const UPDATE_TIME_LEFT_INTERVAL = 30 * 1000

// requests
export const answersPartUrl = 'answers'

async function fetchAnswer(taskId, role) {
    return axios.get(`${tasksBaseUrl}/${taskId}/${answersPartUrl}?size=1&r=${role[0]}`)
}

async function createAnswer(taskId, role) {
    return axios.post(`${tasksBaseUrl}/${taskId}/${answersPartUrl}?r=${role[0]}`)
}

async function updateAnswer(taskId, taskAnswer, role) {
    return axios.put(`${tasksBaseUrl}/${taskId}/${answersPartUrl}/${taskAnswer.id}?r=${role[0]}`, taskAnswer)
}

const TaskAnswerTry = ({ task, role = 'student' }) => {
    const [isFetching, setIsFetching] = useState(false)
    const [answers, setAnswers] = useState(undefined)
    const [selectedAnswerTry, setSelectedAnswerTry] = useState(undefined)
    const [isConfirmed, setIsConfirmed] = useState(undefined)

    const history = useHistory()

    useEffect(() => {
        if (!answers) fetchTaskAnswer()
    }, [])

    const fetchTaskAnswer = () => {
        setIsFetching(true)

        fetchAnswer(task.id, role)
            .then(res => {
                let fetchedData = res.data

                if (fetchedData.items.length > 0 && fetchedData.items[0].answerStatus !== STATUS_NOT_PERMITTED) {
                    history.push('/homeworks')
                } else {
                    setAnswers(fetchedData.items)
                    setSelectedAnswerTry(fetchedData.items[0])
                    setIsConfirmed(fetchedData.items.length > 0)
                }
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
            setSecondsLeft(getSecondsLeft())
            timeLeftInterval.current = setInterval(() => {
                let currentSeconds = getSecondsLeft()
                if (currentSeconds <= 0) clearInterval(timeLeftInterval.current)
                setSecondsLeft(currentSeconds)
            }, UPDATE_TIME_LEFT_INTERVAL)
        }
    }, [selectedAnswerTry])

    const getSecondsLeft = () => {
        return (selectedAnswerTry.startDate + task.duration * 60 * 1000 - new Date()) / 1000
    }

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

    // complete task
    const [isCompleteTaskModalShow, setIsCompleteTaskModalShow] = useState(false)

    const updateStatus = () => {
        let targetAnswer = {
            id: selectedAnswerTry.id,
            answerStatus: STATUS_PERFORMED,
        }

        updateAnswer(task.id, targetAnswer, role)
            .then(res => {
                history.push('/homeworks')
            })
            .catch(error => addErrorNotification('Не удалось обновить статус задания. \n' + error))
            .finally(() => setIsFetching(false))
    }

    let isReadOnly = selectedAnswerTry && !(selectedAnswerTry.answerStatus === STATUS_NOT_PERMITTED && (!secondsLeft || secondsLeft > 0))
    return (
        <>
            <h5 className='mb-1'>Вопросы:</h5>
            {isConfirmed && selectedAnswerTry && (
                <>
                    <div className='d-flex justify-content-between mb-2'>
                        <div className='my-auto'>Оставшееся время: {isReadOnly ? '-' : toLocaleTimeDurationString(secondsLeft)}</div>
                        <div>
                            <Button variant='outline-primary' size='sm' onClick={() => setIsCompleteTaskModalShow(true)} disabled={isReadOnly}>
                                Завершить
                            </Button>
                        </div>
                    </div>
                    <ProgressBar max={selectedAnswerTry.questionCount} now={currentProgress} />
                    <CompleteTaskModal
                        isShow={isCompleteTaskModalShow || isReadOnly}
                        onClose={() => setIsCompleteTaskModalShow(false)}
                        onConfirm={updateStatus}
                        isTaskEnd={isReadOnly}
                    />
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
            {isConfirmed && selectedAnswerTry && (
                <QuestionAnswerList answerId={selectedAnswerTry.id} progress={{ add: addProgress, remove: removeProgress }} readOnly={isReadOnly} />
            )}
        </>
    )
}

const CompleteTaskModal = ({ isShow, isTaskEnd, onClose, onConfirm }) => {
    const TRANSITION_DURATION = 500
    const [isMakeTransition, setIsMakeTransition] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const onConfirmHandle = () => {
        setIsSaving(true)
        onConfirm()
    }

    const onCloseHandle = () => {
        if (!isSaving) onClose()
    }

    useEffect(() => {
        if (!isSaving && isTaskEnd === true) {
            setIsMakeTransition(false)
            onConfirmHandle()
        }
    }, [isTaskEnd])

    return (
        <Modal show={isShow} onHide={onCloseHandle}>
            <div className={'complete-task-modal' + (isSaving ? ' saving' : '')}>
                <Modal.Header closeButton>
                    <Modal.Title>Завершение</Modal.Title>
                </Modal.Header>
                <Modal.Body className='overflow-hidden'>
                    {isSaving && <ProcessBar height='.18Rem' />}
                    <AnimateHeight duration={isMakeTransition ? TRANSITION_DURATION : 0} height={isSaving ? 'auto' : 0}>
                        <div className='saving-label'>Сохранение ваших ответов. Пожалуйста подождите...</div>
                    </AnimateHeight>

                    <AnimateHeight duration={isMakeTransition ? TRANSITION_DURATION : 0} height={isSaving ? 0 : 'auto'}>
                        <div className='confirm-panel'>
                            <div className='confirm-label'>
                                Вы действительно хотите завершить выполнение этого задания и отправить его на проверку? <br />
                                <i>После подтверждения вы больше не сможете изменить свой ответ.</i>
                            </div>

                            <hr />
                            <div className='d-flex justify-content-end'>
                                <Button variant='secondary' onClick={onCloseHandle} className='mr-2'>
                                    Отмена
                                </Button>
                                <Button variant='primary' onClick={onConfirmHandle}>
                                    Завершить
                                </Button>
                            </div>
                        </div>
                    </AnimateHeight>
                </Modal.Body>
            </div>
        </Modal>
    )
}

export default TaskAnswerTry

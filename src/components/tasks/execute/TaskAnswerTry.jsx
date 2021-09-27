import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { Button, Modal, ProgressBar } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'

import AnimateHeight from 'react-animate-height'
import ProcessBar from '../../process-bar/ProcessBar'
import QuestionAnswerList from './question-answer/QuestionAnswerList'
import { addInfoNotification, createError } from '../../notifications/notifications'
import { tasksBaseUrl } from '../../../pages/TaskAnswer'
import { toLocaleTimeDurationString } from '../../common/LocaleTimeString'
import { useContextUpdateCycles } from '../context-function/ContextFunction'
import './TaskAnswerTry.less'

const STATUS_NOT_PERFORMED = 'NOT_PERFORMED'
const STATUS_PERFORMED = 'PERFORMED'
const STATUS_APPRECIATED = 'APPRECIATED'
const STATUS_NOT_ACCEPTED = 'NOT_ACCEPTED'

const UPDATE_TIME_LEFT_INTERVAL = 10 * 1000
const WARNING_AFTER_LEFT_MINUTES = 5

export const AnswerSaveContext = React.createContext()

// requests
export const answersPartUrl = 'answers'

async function updateAnswer(taskId, taskAnswer) {
    return axios.put(`${tasksBaseUrl}/${taskId}/${answersPartUrl}/${taskAnswer.id}?r=s`, taskAnswer)
}

const TaskAnswerTry = ({ homeworkId, task, createLink }) => {
    const [isFetching, setIsFetching] = useState(false)
    const [selectedAnswerTry, setSelectedAnswerTry] = useState(undefined)
    const [isConfirmed, setIsConfirmed] = useState(undefined)

    const [currentProgress, setCurrentProgress] = useState(undefined)

    // timer
    const timeLeftInterval = useRef(undefined)
    const [secondsLeft, setSecondsLeft] = useState(undefined)

    // saving
    const [isCompleteTaskModalShow, setIsCompleteTaskModalShow] = useState(false)
    const [taskSaveModalState, setTaskSaveModalState] = useState(undefined)
    const [updateCycle, questionAnswerSaveRequest] = useContextUpdateCycles()
    const selectedAnswerTryAnswers = useRef(undefined)

    const history = useHistory()

    useEffect(() => {
        fetchTaskAnswer()

        return () => {
            stopTimer()
        }
    }, [])

    const fetchTaskAnswer = () => {
        task.link('answers')
            .fill('homeworkId', homeworkId)
            .fetch(setIsFetching)
            .then(data => {
                let targetAnswerTry = (data.page.totalElements > 0) ? data.list('taskAnswers')[0] : undefined

                if (!targetAnswerTry) {
                    setIsConfirmed(false)
                } else {
                    switch (targetAnswerTry.answerStatus) {
                        case STATUS_NOT_PERFORMED:
                            setSelectedAnswerTry(targetAnswerTry)
                            setIsConfirmed(true)
                            break
                        case STATUS_NOT_ACCEPTED:
                            setIsConfirmed(false)
                            break
                        default:
                            //history.push(`/homeworks/${homeworkId}`)
                    }
                }
            })
            .catch(error => createError('Не удалось загрузить ответ на задание.', error))
    }

    const createTaskAnswer = () => {
        let taskAnswer = {
            type: 'ANSWER',
            taskId: task.id,
        }

        console.log(createLink)

        createLink
            .post(taskAnswer, setIsFetching)
            .then(data => {
                console.log(data)
                setSelectedAnswerTry(data)
                setIsConfirmed(true)
            })
            .catch(error => createError('Не удалось создать ответ на задание.', error))
    }

    // timer
    useEffect(() => {
        if (selectedAnswerTry && !timeLeftInterval.current) {
            setCurrentProgress(selectedAnswerTry.answeredQuestionCount)
            setSecondsLeft(getSecondsLeft())
            timeLeftInterval.current = setInterval(() => {
                let currentSeconds = getSecondsLeft()
                callTimerEvents(currentSeconds)
                setSecondsLeft(currentSeconds)
            }, UPDATE_TIME_LEFT_INTERVAL)
        }
    }, [selectedAnswerTry])

    const isWarningShowed = useRef(false)
    const callTimerEvents = secondsLeft => {
        if (secondsLeft <= 0) {
            setIsCompleteTaskModalShow(true)
            clearInterval(timeLeftInterval.current)
            forceQuestionAnswersSave()
        } else if (task.duration > 5 && secondsLeft < WARNING_AFTER_LEFT_MINUTES * 60 && !isWarningShowed.current) {
            isWarningShowed.current = true
            addInfoNotification(`Внимание, до окончания выполнения работы осталось ${WARNING_AFTER_LEFT_MINUTES} минут.`)
        }
    }

    const getSecondsLeft = () => {
        return (selectedAnswerTry.startDate + task.duration * 60 * 1000 - new Date()) / 1000
    }

    const stopTimer = () => {
        clearInterval(timeLeftInterval.current)
    }

    // progress
    const addProgress = (count = 1) => {
        setCurrentProgress(currentProgress + count)
    }

    const removeProgress = (count = 1) => {
        setCurrentProgress(currentProgress - count)
    }

    // complete task answer
    const updateStatus = () => {
        let targetAnswer = {
            id: selectedAnswerTry.id,
            answerStatus: STATUS_PERFORMED,
        }

        updateAnswer(task.id, targetAnswer)
            .then(res => {
                setTaskSaveModalState(modalStateConst.SAVED)
                setTimeout(() => {
                    //history.push(`/homeworks/${homeworkId}`)
                }, 5000)
             })
            .catch(error => createError('Не удалось обновить статус задания.', error))
            .finally(() => setIsFetching(false))
    }

    // save question answers
    const questionAnswersResponsedCount = useRef(0)
    const expectedQuestionAnswerResponsesCount = useRef(0)
    const isOnSaveErrors = useRef(false)
    const forceQuestionAnswersSave = () => {
        setTaskSaveModalState(modalStateConst.SAVING)

        isOnSaveErrors.current = false
        questionAnswersResponsedCount.current = 0
        expectedQuestionAnswerResponsesCount.current = selectedAnswerTryAnswers.current ? selectedAnswerTryAnswers.current.length : 0

        stopTimer()
        questionAnswerSaveRequest()

        let targetSelectedAnswerTry = selectedAnswerTry
        targetSelectedAnswerTry.answerStatus = STATUS_PERFORMED
        setSelectedAnswerTry(targetSelectedAnswerTry)
    }

    
    const onTaskAnswerSave = isSuccess => {
        questionAnswersResponsedCount.current++
        if(!isSuccess) isOnSaveErrors.current = true
        if (questionAnswersResponsedCount.current >= expectedQuestionAnswerResponsesCount.current) {
            if(!isOnSaveErrors.current) 
                updateStatus() 
            else {
                setTaskSaveModalState(modalStateConst.SAVE_ERROR)
            }
        }
    }

    const setSelectedAnswerTryAnswers = questionAnswers => {
        selectedAnswerTryAnswers.current = questionAnswers
    }

    var isReadOnly = selectedAnswerTry && secondsLeft != null && !(selectedAnswerTry.answerStatus === STATUS_NOT_PERFORMED && secondsLeft > 0)
    return (
        <>
            <h5 className='mb-1'>Вопросы:</h5>
            {isConfirmed && selectedAnswerTry && (
                <>
                    <div className='d-flex justify-content-between mb-2'>
                        <div className='my-auto'>Оставшееся время: {isReadOnly || !selectedAnswerTry.completionDate ? '-' : toLocaleTimeDurationString(secondsLeft)}</div>
                        <div>
                            <Button variant='outline-primary' size='sm' onClick={() => {
                                    setIsCompleteTaskModalShow(true)
                                    setTaskSaveModalState(modalStateConst.CONFIRM)
                                }} disabled={isReadOnly}>
                                Завершить
                            </Button>
                        </div>
                    </div>
                    <ProgressBar max={selectedAnswerTry.questionCount} now={currentProgress} />
                    <CompleteTaskModal
                        isShow={isCompleteTaskModalShow}
                        modalState={taskSaveModalState}
                        onClose={() => {
                            setIsCompleteTaskModalShow(false)
                            setTaskSaveModalState(modalStateConst.NONE)
                        }}
                        onConfirm={forceQuestionAnswersSave}
                        onRefresh={forceQuestionAnswersSave}
                    />
                </>
            )}

            {isFetching && <ProcessBar height='.18Rem' className='mt-2' />}
            {isConfirmed === false && (
                <div className='text-center'>
                    <div className='mx-auto my-3'>
                        <b>Вопросы еще не получены, так как выполнение задания еще не начато.</b>
                        <br />
                        Вы можете ознакомится с условиями задания и начать его выполнение.
                    </div>
                    <Button variant='outline-primary' type='submit' onClick={() => createTaskAnswer(true)} disabled={isFetching}>
                        Начать выполнение
                    </Button>
                </div>
            )}
            {isConfirmed && selectedAnswerTry && (
                <AnswerSaveContext.Provider value={{ onTaskAnswerSave, updateCycle }}>
                    <QuestionAnswerList
                        answerId={selectedAnswerTry.id}
                        progress={{ add: addProgress, remove: removeProgress }}
                        setQuestionAnswers={setSelectedAnswerTryAnswers}
                        readOnly={false}
                        questionsLink={selectedAnswerTry.link('questions')}
                    />
                </AnswerSaveContext.Provider>
            )}
        </>
    )
}

const modalStateConst = {
    NONE: 0,
    CONFIRM: 1,
    SAVING: 2,
    SAVED: 3,
    SAVE_ERROR: 4
}

const MODAL_TRANSITION_DURATION = 500

const CompleteTaskModal = ({ isShow, modalState, onClose, onConfirm, onRefresh }) => {
    const onCloseHandle = () => {
        if (modalState === modalStateConst.CONFIRM) {
            onClose()
        }
    }

    return (
        <Modal show={isShow} onHide={onCloseHandle}>
            <div className='complete-task-modal'>
                <Modal.Header closeButton>
                    <Modal.Title>Завершение</Modal.Title>
                </Modal.Header>
                <Modal.Body className='overflow-hidden'>
                    {modalState === modalStateConst.SAVING && <ProcessBar height='.18Rem' />}
                    <AnimateHeight duration={MODAL_TRANSITION_DURATION} height={modalState === modalStateConst.CONFIRM ? 'auto' : 0}>
                        <div className='confirm-panel'>
                            <div className='confirm-label'>
                                Вы действительно хотите завершить выполнение этого задания и отправить его на проверку? 
                                <br />
                                <i>
                                    После подтверждения вы больше не сможете изменить свой ответ.
                                </i>
                            </div>

                            <hr />
                            <div className='d-flex justify-content-end'>
                                <Button variant='secondary' onClick={onCloseHandle} className='mr-2'>
                                    Отмена
                                </Button>
                                <Button variant='primary' onClick={onConfirm}>
                                    Завершить
                                </Button>
                            </div>
                        </div>
                    </AnimateHeight>

                    <AnimateHeight duration={MODAL_TRANSITION_DURATION} height={modalState === modalStateConst.SAVING ? 'auto' : 0}>
                        <div className='saving-label'>Сохранение ваших ответов. Пожалуйста подождите...</div>
                    </AnimateHeight>

                    <AnimateHeight duration={MODAL_TRANSITION_DURATION} height={modalState === modalStateConst.SAVED ? 'auto' : 0}>
                        <div className='saving-label'>Успешно сохранено</div>
                    </AnimateHeight>

                    <AnimateHeight duration={MODAL_TRANSITION_DURATION} height={modalState === modalStateConst.SAVE_ERROR ? 'auto' : 0}>
                        <div className='saving-label'>
                            <div>
                                <div>Во время сохранения произошла ошибка, возможно некоторые вопросы не сохранены.</div>
                                <br />
                                <div>
                                    <i>
                                        Не нужно паниквать, проверьте свое подключение и повторите попытку. Имейте в виду, что при закрытии страницы браузера 
                                        ваши несохраненные ответы будут утеряны.
                                    </i>
                                </div>
                            </div>
                            <Button variant='primary' onClick={onRefresh} className='w-100 mt-3'>
                                Повторить
                            </Button>
                        </div>
                    </AnimateHeight>
                </Modal.Body>
            </div>
        </Modal>
    )
}

export default TaskAnswerTry

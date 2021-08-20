import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { toLocaleTimeDurationString } from '../../common/LocaleTimeString'

import { LoadingItem } from '../../loading/LoadingList'

const ConfirmStartTask = ({ task, onConfirm }) => {
    const [isConfirmModalShow, setIsConfirmModalShow] = useState(false)

    const onClose = () => {
        setIsConfirmModalShow(false)
    }

    let duration = minsToTime(task?.duration * 60)
    return (
        <>
            {task ? (
                <div className='my-4 text-center'>
                    <div className='mx-auto mb-3'>
                        <b>Вопросы еще не получены, так как выполнение задания еще не начато.</b>
                        <br />
                        Вы можете ознакомится с условиями задания и начать его выполнение.
                    </div>
                    <Button variant='outline-primary' type='submit' onClick={() => setIsConfirmModalShow(true)}>
                        Начать выполнение
                    </Button>
                </div>
            ) : (
                <LoadingItem height='3Rem' width='80%' className=' my-4 mx-auto' />
            )}

            <Modal show={isConfirmModalShow} onHide={() => onClose()}>
                <Modal.Header closeButton>
                    <Modal.Title>Начать выполнение задания</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {duration ? (
                        <>
                            <div>Время на выполнение задания ограничено и равно </div>
                            <div className='my-2 text-center'>
                                <i className='fas fa-hourglass-start text-secondary' /> {duration}
                            </div>
                            <div className='font-italic'>
                                Будет идти обратный отсчет времени с момента начала вашей попытки, и вы должны завершить задание до окончания времени.
                                <br />
                                <br />
                            </div>
                        </>
                    ) : (
                        <div>Время на выполнение задания неограничено, но время начала и окончания вашей попытки будет зафиксировано.</div>
                    )}
                    <span>Вы уверены, что хотите начать выполнение данного задания прямо сейчас?</span>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant='secondary' onClick={() => onClose()}>
                        Отмена
                    </Button>
                    <Button variant='primary' type='submit' onClick={() => onConfirm()}>
                        Начать
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

const minsToTime = mins => {
    if (mins == 0) return undefined
    else return toLocaleTimeDurationString(mins)
}

export default ConfirmStartTask

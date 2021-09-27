import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import usePageTitle from '../../feedback/usePageTitle'
import { createError } from '../../notifications/notifications'
import ProcessBar from '../../process-bar/ProcessBar'
import TaskAnswerTry from './TaskAnswerTry'
import TaskDetails from './TaskDetails'

const ExecuteTaskModal = ({ show, onClose, taskLink, createLink, interview }) => {
    const [taskHref, setTaskHref] = useState(undefined)
    const [isFetching, setIsFetching] = useState(false)
    const [task, setTask] = useState(undefined)

    usePageTitle({ title: task?.name })

    useEffect(() => {
        // reopen the same task not call fetching
        if(taskHref !== taskLink?.href) {
            fetchTask()
            setTaskHref(taskLink.href)
        }
    }, [taskLink])

    const fetchTask = () => {
        taskLink
            ?.fetch(setIsFetching)
            .then((data) => {
                setTask(data)
            })
            .catch(error => createError('Не удалось загрузить информацию о задании.', error))
    }

    return (
        <Modal show={show} onHide={onClose} size='lg'>
            <ProcessBar height='.18Rem' active={isFetching} />
            <Modal.Body>
                <button type='button' className='close' onClick={() => onClose()}>
                    <span aria-hidden='true'>×</span>
                    <span className='sr-only'>Close</span>
                </button>
                <TaskDetails task={task} isFetching={isFetching} />
                {task && <TaskAnswerTry task={task} createLink={createLink} interview={interview} />}
            </Modal.Body>
        </Modal>
    )
}

export default ExecuteTaskModal

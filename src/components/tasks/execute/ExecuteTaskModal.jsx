import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import usePageTitle from '../../feedback/usePageTitle'
import { createError } from '../../notifications/notifications'
import ProcessBar from '../../process-bar/ProcessBar'
import TaskAnswerTry from './TaskAnswerTry'
import TaskDetails from './TaskDetails'

const ExecuteTaskModal = ({ show, onClose, taskLink, createLink, interview, onCreateAnswer }) => {
    const [isFetching, setIsFetching] = useState(false)
    const [task, setTask] = useState(undefined)
    const [hideByModal, setHideByModal] = useState(false)
    const [needForceSave, setNeedForceSave] = useState(false)

    usePageTitle({ title: task?.name })

    useEffect(() => {
        fetchTask()
    }, [taskLink])

    const fetchTask = () => {
        taskLink
            ?.fetch(setIsFetching)
            .then((data) => {
                setTask(data)
            })
            .catch(error => createError('Не удалось загрузить информацию о задании.', error))
    }

    const onCloseHadnler = () => {
        setNeedForceSave(false)
        onClose()
    }

    useEffect(() => {
        if(!show) setTask(undefined)
    }, [show])

    return (
        <Modal show={show} onHide={onClose} size='lg' style={{zIndex: (hideByModal ? '1000' : '1050')}}>
            <ProcessBar height='.18Rem' active={isFetching} />
            <Modal.Body>
                <button type='button' className='close' onClick={() => setNeedForceSave(true)}>
                    <span aria-hidden='true'>×</span>
                    <span className='sr-only'>Close</span>
                </button>
                <TaskDetails task={task} isFetching={isFetching} />
                {task && (
                    <TaskAnswerTry 
                        task={task} 
                        createLink={createLink} 
                        interview={interview} 
                        setTaskModalHide={setHideByModal} 
                        onClose={onCloseHadnler} 
                        onCreateAnswer={onCreateAnswer} 
                        needForceSave={needForceSave} 
                    />
                )}
            </Modal.Body>
        </Modal>
    )
}

export default ExecuteTaskModal

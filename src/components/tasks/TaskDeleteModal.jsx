import React from 'react'
import { Button, Modal, Form } from 'react-bootstrap'
import ProcessBar from '../process-bar/ProcessBar'

const TaskDeleteModal = ({ taskToDelete, isFetching = false, onSubmit, onClose }) => {
    const onCloseHandler = () => {
        if (!isFetching) onClose()
    }

    return (
        <>
            <Modal show={true} onHide={onCloseHandler}>
                <Modal.Header closeButton>
                    <Modal.Title>Удалить задание</Modal.Title>
                </Modal.Header>
                <Form
                    onSubmit={e => {
                        e.preventDefault()
                        onSubmit(taskToDelete)
                    }}>
                    <ProcessBar active={isFetching} height='.18Rem' />
                    <Modal.Body>
                        <Form.Label>
                            Вы дейтсвительно хотите удалить задание {taskToDelete.name}?
                            <br />
                            <i class='font-size-12'>* Ответы учеников на данное задание удалены не будут</i>
                        </Form.Label>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant='secondary' onClick={onCloseHandler}>
                            Закрыть
                        </Button>
                        <Button variant='danger' type='submit'>
                            Удалить
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}

export default TaskDeleteModal

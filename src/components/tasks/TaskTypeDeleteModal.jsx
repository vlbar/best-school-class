import React from 'react'
import { Button, Modal, Form } from 'react-bootstrap'
import ProcessBar from '../process-bar/ProcessBar'

export const TaskTypeDeleteModal = ({deletedTaskType, isFetching = false, onSubmit, onClose}) => {
    const onCloseHandler = () => {
        if(!isFetching) onClose()
    }

    return (
        <>
            <Modal show onHide={onCloseHandler}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Удалить тип задания
                    </Modal.Title>
                </Modal.Header>
                    <ProcessBar active={isFetching} height='.18Rem' />
                    <Form onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit(deletedTaskType)
                    }}>
                        <Modal.Body>
                            <Form.Label>Вы дейтсвительно хотите удалить тип задания {deletedTaskType.name}?</Form.Label>
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
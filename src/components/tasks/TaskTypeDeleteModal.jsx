import React from 'react'
import { Button, Modal, Form } from 'react-bootstrap'

export const TaskTypeDeleteModal = ({deletedTaskType, onSubmit, onClose}) => {
    return (
        <>
            <Modal show onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Удалить тип задания
                    </Modal.Title>
                </Modal.Header>
                    <Form onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit(deletedTaskType)
                    }}>
                        <Modal.Body>
                            <Form.Label>Вы дейтсвительно хотите удалить тип задания {deletedTaskType.name}?</Form.Label>
                        </Modal.Body>

                        <Modal.Footer>
                            <Button variant='secondary' onClick={onClose}>
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
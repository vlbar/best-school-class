import React from 'react'
import { Button, Modal, Form } from 'react-bootstrap'

export const DeleteCourseModal = ({deletedCourse, onSubmit, onClose}) => {
    return (
        <>
            <Modal show={true} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Удалить курс
                    </Modal.Title>
                </Modal.Header>
                    <Form onSubmit={(e) => {
                        e.preventDefault()
                        onSubmit(deletedCourse)
                    }}>
                        <Modal.Body>
                            <Form.Label>Вы дейтсвительно хотите удалить курс '{deletedCourse.name}' и <u className='text-danger'> все его подкурсы и задания</u></Form.Label>
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
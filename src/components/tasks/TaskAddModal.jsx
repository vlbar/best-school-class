import React, { useState } from 'react'
import { Button, Modal, Form } from 'react-bootstrap'
import ProcessBar from '../process-bar/ProcessBar'
import useBestValidation from './edit/useBestValidation'

//validation
const taskValidationSchema = {
    name: {
        type: 'string',
        required: ['Не введено название задания'],
        min: [3, 'Слишком короткое название'],
        max: [100, 'Слишком длинное название'],
    },
}

export const TaskAddModal = ({ show, onSubmit, onClose, isFetching }) => {
    const [task, setTask] = useState({
        name: '',
        maxScore: 100,
    })

    const setName = name => {
        setTask({ ...task, name: name })
    }

    const taskValidation = useBestValidation(taskValidationSchema)

    const submitHandle = () => {
        if (taskValidation.validate(task)) onSubmit(task)
    }

    return (
        <>
            <Modal show={show} onHide={onClose} className='overflow-hidden'>
                {isFetching && <ProcessBar className='position-absolute border-top' height='.18Rem' />}
                <Modal.Header closeButton>
                    <Modal.Title>Добавить задание</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group controlId='formBasicEmail' style={{ marginBottom: 0 }}>
                        <Form.Label>Название задания</Form.Label>
                        <Form.Control
                            name='name'
                            type='text'
                            placeholder='Введите название задания...'
                            value={task.name}
                            onChange={e => {
                                taskValidation.changeHandle(e)
                                setName(e.target.value)
                            }}
                            onBlur={taskValidation.blurHandle}
                            isInvalid={taskValidation.errors.name}
                            disabled={isFetching}
                        />
                        <Form.Control.Feedback type='invalid'>{taskValidation.errors.name}</Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant='secondary' onClick={onClose}>
                        Закрыть
                    </Button>
                    <Button variant='primary' type='submit' onClick={submitHandle}>
                        Добавить
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

import React from 'react'
import { Button, Modal, Form } from 'react-bootstrap'
import ProcessBar from '../process-bar/ProcessBar'
import { Formik, Field } from 'formik'
import * as Yup from 'yup'

const taskSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Слишком короткое название')
        .max(250, 'Слишком длинное название')
        .trim()
        .required('Не введено название задания')
});

export const TaskAddModal = ({show, onSubmit, onClose, taskToAdd, isFetching}) => {
    const submitHandle = (values) => {
        onSubmit(values)
    }

    return (
        <>
            <Modal show={show} onHide={onClose} className='overflow-hidden'>
                {isFetching && <ProcessBar className='position-absolute border-top' height='.18Rem'/>}
                <Modal.Header closeButton>
                    <Modal.Title>
                        Добавить задание
                    </Modal.Title>
                </Modal.Header>
                <Formik
                    initialValues={{
                        name: taskToAdd?.name || ''
                    }}
                    validationSchema={taskSchema}
                    onSubmit={values => {
                        submitHandle(values)
                    }}
                >
                    {({ errors, touched, submitForm }) => (
                        <Form onSubmit={(e) => {
                            e.preventDefault();
                            submitForm();
                        }}>
                            <Modal.Body>
                                
                                <Form.Group controlId='formBasicEmail' style={{marginBottom: 0}}>
                                    <Form.Label>Название задания</Form.Label>
                                    <Field 
                                        as={Form.Control} 
                                        name='name' 
                                        type='text' 
                                        placeholder="Введите название задания..." 
                                        isInvalid={touched.name && errors.name}
                                        disabled={isFetching}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant='secondary' onClick={onClose}>
                                    Закрыть
                                </Button>
                                <Button variant='primary' type='submit'>
                                   Добавить
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    )
}
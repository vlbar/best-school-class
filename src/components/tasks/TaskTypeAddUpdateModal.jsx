import React from 'react'
import { Button, Modal, Form } from 'react-bootstrap'
import { Formik, Field } from 'formik'
import * as Yup from 'yup'

import './TaskTypeAddUpdateModal.less'
import ProcessBar from '../process-bar/ProcessBar'

const taskTypeSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Слишком короткое название')
        .max(50, 'Слишком длинное название')
        .trim()
        .required('Не введено название типа работы')
});

export const TaskTypeAddUpdateModal = ({onSubmit, onClose, isFetching = false, updatedTaskType}) => {
    const submitHandle = (values) => {
        if(updatedTaskType !== undefined) 
            onSubmit({...updatedTaskType, ...values})
        else 
            onSubmit(values)
    }

    const onCloseHandler = () => {
        if(!isFetching) onClose()
    }

    return (
        <>
            <Modal show onHide={onCloseHandler} className='processable-modal'>
                <Modal.Header closeButton>
                    <Modal.Title>
                    {!updatedTaskType ?
                        'Добавить тип задания' :
                        'Изменить тип задания'}
                    </Modal.Title>
                </Modal.Header>
                <ProcessBar active={isFetching} height='.18Rem' />
                <Formik
                    initialValues={{
                        name: updatedTaskType?.name || ''
                    }}
                    validationSchema={taskTypeSchema}
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
                                    <Form.Label>Название типа задания</Form.Label>
                                    <Field 
                                        as={Form.Control} 
                                        name='name' 
                                        type='text'
                                        laceholder="Введите название типа задания..." 
                                        isInvalid={touched.name && errors.name}/>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant='secondary' onClick={onCloseHandler}>
                                    Закрыть
                                </Button>
                                <Button variant='primary' type='submit'>
                                    {updatedTaskType ? 'Изменить' : 'Добавить'}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    )
}
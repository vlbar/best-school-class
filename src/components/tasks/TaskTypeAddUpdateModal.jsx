import React from 'react'
import { Button, Modal, Form } from 'react-bootstrap'
import { Formik, Field } from 'formik'
import * as Yup from 'yup'

import './TaskTypeAddUpdateModal.less'
import ProcessBar from '../process-bar/ProcessBar'
import InputField from '../common/InputField'

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
                                <Field 
                                    as={Form.Control} 
                                    name='name' 
                                    type='text' 
                                    isInvalid={touched.name && errors.name}
                                    label="Название типа задания"
                                    component={InputField}
                                    errorMessage={errors.name}
                                />
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
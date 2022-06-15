import React from 'react'
import * as Yup from 'yup'
import { Button, Modal, Form } from 'react-bootstrap'
import { Formik, Field } from 'formik'

import InputField from './../common/InputField';

const courseSchema = Yup.object().shape({
    name: Yup.string()
        .min(3, 'Слишком короткое название')
        .max(50, 'Слишком длинное название')
        .trim()
        .required('Не введено название курса')
});

export const CourseAddUpdateModal = ({onSubmit, onClose, parentCourse, updatedCourse, show}) => {
    const submitHandle = (values) => {
        if(updatedCourse !== undefined) 
            onSubmit({...updatedCourse, ...values})
        else 
            onSubmit(values)
    }

    const getTitle = () => {
        if(!updatedCourse)
            return !parentCourse
                ? 'Добавить раздел'
                : 'Добавить подраздел'
        else
            return 'Изменить раздел'
    } 

    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {getTitle()}
                    </Modal.Title>
                </Modal.Header>
                
                <Formik
                    initialValues={{
                        name: updatedCourse?.name || ''
                    }}
                    validationSchema={courseSchema}
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
                                    label="Название раздела"
                                    component={InputField}
                                    errorMessage={errors.name}
                                />
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant='secondary' onClick={onClose}>
                                    Закрыть
                                </Button>
                                <Button variant='primary' type='submit'>
                                    {updatedCourse ? 'Изменить' : 'Добавить'}
                                </Button>
                            </Modal.Footer>
                        </Form>
                    )}
                </Formik>
            </Modal>
        </>
    )
}
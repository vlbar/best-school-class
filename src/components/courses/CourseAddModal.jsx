import React, { useState } from 'react'
import { Button, Modal, Form } from 'react-bootstrap'
import { useFormik } from 'formik';
import * as Yup from 'yup';

export const CourseAddModal = ({onSubmit, onClose, parentCourse, show}) => {
    const formik = useFormik({
        initialValues: {
          name: ''
        },
        validationSchema: Yup.object({
          name: Yup.string()
            .min(3, 'Слишком короткое название')
            .max(50, 'Слишком длинное название')
            .required('Не введено название курса')
        }),
        onSubmit: values => {
            submitHandle(values)
        }
    })

    const submitHandle = (values) => {
        onSubmit(values, parentCourse)
    }

    return (
        <>
            <Modal show={show} onHide={onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {parentCourse == undefined
                            ? 'Добавить курс'
                            : 'Добавить подкурс'
                        }
                    </Modal.Title>
                </Modal.Header>
                
                <Form noValidate onSubmit={formik.handleSubmit}>
                    <Modal.Body>
                        <Form.Group controlId='formBasicEmail' style={{marginBottom: 0}}>
                            <Form.Label>Название курса</Form.Label>
                            <Form.Control 
                                required
                                isInvalid={formik.errors.name !== undefined}
                                type='text' name='name'
                                placeholder="Введите название курса..." 
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formik.errors.name}
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
            </Modal>
        </>
    )
}
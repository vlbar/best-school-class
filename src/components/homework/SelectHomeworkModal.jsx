import React, { useState } from 'react'
import { Modal, Button } from 'react-bootstrap'

import HomeworkList from './HomeworkList'
import './SelectHomeworkModal.less'


const SelectHomeworkModal = ({show, onClose, onSelect}) => {
    return (
        <Modal show={show} onHide={onClose} size='lg'>
            <Modal.Header closeButton>
                <Modal.Title>Домашнее задание</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <h6 className='mb-2'>Выбрать существующее домашнее:</h6>
                <HomeworkList onSelect={onSelect} className='select-homework-list' />

                <p className='text-center text-muted'>или</p>
                <Button variant="outline-primary" className='w-100' onClick={() => onSelect(undefined)}>
                    Создать новое
                </Button>
            </Modal.Body>
        </Modal>
    )
}

export default SelectHomeworkModal
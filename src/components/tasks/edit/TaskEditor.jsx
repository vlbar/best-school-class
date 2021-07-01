import React, { useState } from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'
import { sortableContainer, sortableElement, arrayMove } from 'react-sortable-hoc'
import { TaskQuestion } from './TaskQuestion'
import './TaskEditor.less'

const MINUTES = 'MINUTES'
const HOURS = 'HOURS'
const DAYS = 'DAYS'
const getTimeName = (type, num) => {
    switch(type) {
        case MINUTES:
            if(num == 1) return 'Минута'
            else if(num >= 2 && num <= 4) return 'Минуты'
            else return 'Минут'
        case HOURS:
            if(num == 1) return 'Час'
            else if(num >= 2 && num <= 4) return 'Часа'
            else return 'Часов'
        case DAYS:
            if(num == 1) return 'День'
            else if(num >= 2 && num <= 4) return 'Дня'
            else return 'Дней'
    }
}

// sortable hoc
const SortableContainer = sortableContainer(({children}) => <div>{children}</div>)
const SortableItem = sortableElement(({question, questionToEditHadnle, questionToEdit}) => (
    <TaskQuestion question={question} questionToEdit={questionToEdit} questionToEditHadnle={questionToEditHadnle}/>
))
  

export const TaskEditor = ({taskId}) => {
    const [duration, setDuration] = useState('')
    const [questions, setQuestions] = useState([
        {
            id: 1
        },
        {
            id: 2
        },
        {
            id: 3
        }
    ])

    const [questionToChange, setQuestionToChange] = useState()
    const onSortEnd = ({oldIndex, newIndex}) => {
        setQuestions(arrayMove(questions, oldIndex, newIndex))
    }

    return (
        <>
            <Container>
                <h4 className='mt-3'>Задание</h4>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Название
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control type='text' placeholder='Введите название задания...' />
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Описание задания
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control as='textarea' placeholder='Введите описание задания...' rows={3} style={{maxHeight: '86px', minHeight: '40px'}}/>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2} className='pt-0'>
                        Максимальная оценка
                    </Form.Label>
                    <Col sm={10}>
                        <Form.Control type='number' min={1} defaultValue='100' placeholder='Введите максимальный балл...' />
                        <Form.Text className="text-muted">
                            К этому числу будут переводится количество баллов, полученные учеником
                        </Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column sm={2}>
                        Длительность
                    </Form.Label>
                    <Col sm={10}>
                        <div className='task-duration'>
                            <Form.Control type='number' min={1} value={duration} onChange={(e) => setDuration(e.target.value)}/>
                            <Form.Control as="select">
                                <option>{getTimeName(MINUTES, duration)}</option>
                                <option>{getTimeName(HOURS, duration)}</option>
                                <option>{getTimeName(DAYS, duration)}</option>
                            </Form.Control>
                        </div>
                    </Col>
                </Form.Group>
                <hr/>
                <SortableContainer onSortEnd={onSortEnd} useDragHandle>
                    {questions.map((question, index) => (
                        <SortableItem key={question.id} index={index} question={question} questionToEdit={questionToChange} questionToEditHadnle={setQuestionToChange} />
                    ))}
                </SortableContainer>
                <Button variant='outline-primary mb-4' className='w-100'>Добавить</Button>
            </Container>
        </>
    )
}
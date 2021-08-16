import React from 'react'
import { Container } from 'react-bootstrap'
import { useHistory, useParams } from 'react-router-dom'

import usePageTitle from '../components/feedback/usePageTitle'
import HomeworkList from '../components/homework/HomeworkList'
import { STUDENT } from '../redux/state/stateActions'

function Homeworks() {
    const { homeworkId } = useParams()
    const history = useHistory()
    usePageTitle({title: homeworkId ? 'Домашнее задание' : 'Задания'})

    return homeworkId ? (
        <Container>HW {homeworkId}</Container>
    ) : (
        <Container>
            <h4 className='my-3'>Текущие задания</h4>
            <HomeworkList role={STUDENT} className='high-homework-list' canExpandTasks={false} onClick={(hw) => history.push(`/homeworks/${hw.id}`)} />
        </Container>
    )
}

export default Homeworks;
import React, { useEffect, useState } from 'react'
import { Badge, Row, Col, ProgressBar } from 'react-bootstrap'
import { useHistory } from 'react-router-dom'
import axios from 'axios'

import { addErrorNotification } from '../notifications/notifications'
import { LoadingItem } from '../loading/LoadingList'
import ProcessBar from '../process-bar/ProcessBar'
import HomeworkTaskList from './HomeworkTaskList'
import './HomeworkDetails.less'

let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }

// requests
const baseUrl = '/homeworks'

async function fetchDetails(homeworkId) {
    return axios.get(`${baseUrl}/${homeworkId}`)
}

const HomeworkDetails = ({ homeworkId }) => {
    const [isFetching, setIsFetching] = useState(false)
    const [homework, setHomework] = useState(undefined)

    const history = useHistory()

    useEffect(() => {
        fetchHomeworkDetails()
    }, [])

    const fetchHomeworkDetails = () => {
        setIsFetching(true)

        fetchDetails(homeworkId)
            .then(res => setHomework(res.data))
            .catch(error => addErrorNotification('Не удалось загрузить список домащних работ. \n' + error))
            .finally(() => setIsFetching(false))
    }

    return (
        <>
            <div className='d-flex flex-wrap justify-content-between mt-3'>
                <div className='d-flex flex-row'>
                    <h5 className='mr-2 mb-1'>Домашняя работа</h5>
                    <div>
                        <Badge variant='secondary' className='y-auto'>
                            Завершено
                        </Badge>
                    </div>
                </div>
                <div className='d-flex'>
                    {homework ? (
                        <>
                            <div>
                                <div className='select-group-circle mt-1' style={{ backgroundColor: homework.group.color ?? '#343a40' }} />
                            </div>
                            <b className='text-link' onClick={() => history.push(`/groups/${homework.group.id}`)}>
                                {homework.group.name}
                            </b>
                        </>
                    ) : (
                        <LoadingItem width='100px' />
                    )}
                </div>
            </div>

            <ProcessBar active={isFetching} height='.18Rem' className='mt-1 mb-2' />

            {homework ? (
                <Row>
                    <Col md={6}>
                        <div className={'homework-card mb-2' + (isFetching ? 'loading' : '')}>
                            <div className='just-homework-line' />
                            <div>
                                <span>
                                    <span className='text-secondary'> Назначено:</span>{' '}
                                    {/* мб иконачку :/ */}
                                    <b className='text-link'>Солодилов П.Р.</b>
                                </span>
                            </div>
                            <div>
                                <span>
                                    <span className='text-secondary'>Срок сдачи:</span>{' '}
                                    <b> до {new Date(homework.endingDate).toLocaleString('ru-RU', options)}</b>
                                </span>
                            </div>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className='homework-card'>
                            <div className='just-homework-line' />
                            <div className='d-flex flex-row'>
                                <i className='far fa-clock fa-3x'></i>
                                <div className='w-100 ml-3'>
                                    <div className='d-flex justify-content-between flex-wrap mb-2'>
                                        <span>Выполняется</span>
                                        <span>1/2</span>
                                    </div>
                                    <ProgressBar now={50} />
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            ) : (
                <Row>
                    <Col md={6}>
                        <div className='loading-homework-card mb-2'>
                            <div className='just-homework-line' />
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className='loading-homework-card'>
                            <div className='just-homework-line' />
                        </div>
                    </Col>
                </Row>
            )}

            <h5 className='mt-3 mb-2'>Задания</h5>
            {homework && <HomeworkTaskList tasks={homework.tasks} homeworkId={homeworkId} />}
        </>
    )
}

export default HomeworkDetails

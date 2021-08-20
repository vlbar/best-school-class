import React from 'react'
import { Badge } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import { getTaskTypeColor } from '../TaskTypeDropdown'
import { LoadingItem } from '../../loading/LoadingList'
import ProcessBar from '../../process-bar/ProcessBar'
import { toLocaleTimeDurationString } from '../../common/LocaleTimeString'

const TaskDetails = ({ task, isFetching }) => {

    let isDataLoading = isFetching || !task
    return (
        <div>
            <div>
                <Link to='/homeworks' className='text-secondary text-decoration-none nav-link'>
                    <i className='fas fa-chevron-left'></i> Вернуться
                </Link>
            </div>

            <ProcessBar active={isFetching} height='.18Rem' className='mt-1' />
            {isDataLoading ? (
                <>
                    <LoadingItem height='1.2Rem' width='250px' className='my-1' />
                    <LoadingItem height='1Rem' width='200px' className='my-2' />
                    <LoadingItem height='3Rem' width='80%' className='my-4' />
                    <LoadingItem height='64px' width='100%' className='my-4' />
                </>
            ) : (
                <>
                    <div className='d-flex flex-wrap justify-content-between'>
                        <div className='mb-2'>
                            <div className='d-flex flex-wrap align-items-center'>
                                <h4 className='mr-2 mb-0'>{task.name}</h4>
                                {task.taskType !== null && (
                                    <div>
                                        <Badge variant='secondary' style={{ backgroundColor: getTaskTypeColor(task.taskType.id) }}>
                                            {task.taskType.name}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                            <div>
                                <span className='text-secondary'>Из курса: {task.course.name}</span>
                            </div>
                        </div>
                        <div className='mb-3'>
                            <div>{task.creatorId}</div>
                            <div className='text-secondary'>Составитель</div>
                        </div>
                    </div>

                    {/* DANGER */}
                    <div className='text-break' dangerouslySetInnerHTML={{ __html: task.description }}></div>

                    <div className='homework-card my-4'>
                        <div className='just-homework-line' />
                        <div>
                            <div>Длительность: {task.duration > 0 ? toLocaleTimeDurationString(task.duration * 60) : 'Неограничено'}</div>
                            <div>Максимальная оценка: {task.maxScore}</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default TaskDetails

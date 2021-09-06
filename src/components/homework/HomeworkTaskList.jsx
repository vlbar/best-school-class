import React, { useState, useRef, useEffect } from 'react'
import { Badge, Button } from 'react-bootstrap'
import AnimateHeight from 'react-animate-height'
import { useHistory } from 'react-router-dom'

import { getTaskTypeColor } from '../tasks/TaskTypeDropdown'
import './HomeworkTaskList.less'

const MAX_DISPLAY_TASKS = 3

const HomeworkTaskList = ({ tasks, homeworkId }) => {
    const isNeedExpand = useRef(tasks.length > MAX_DISPLAY_TASKS)
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <>
            <div className='homework-task-list'>
                {tasks && (
                    <>
                        {tasks.slice(0, MAX_DISPLAY_TASKS).map(task => {
                            return <TaskTableItem key={task.id} task={task} homeworkId={homeworkId} />
                        })}

                        <AnimateHeight duration={220} height={isExpanded ? 'auto' : 0}>
                            {tasks.slice(MAX_DISPLAY_TASKS, tasks.length).map(task => {
                                return <TaskTableItem key={task.id} task={task} homeworkId={homeworkId} />
                            })}
                        </AnimateHeight>
                    </>
                )}
            </div>
            {isNeedExpand.current && (
                <div className='d-flex justify-content-center'>
                    <div className={'mt-1 expand-button' + (isExpanded ? ' active' : '')} onClick={() => setIsExpanded(!isExpanded)}>
                        <i className='fas fa-chevron-down mr-2 mt-1' />
                        <span className='expand-text'>{isExpanded ? 'Свернуть' : 'Развернуть'}</span>
                    </div>
                </div>
            )}
        </>
    )
}

const TaskTableItem = ({ task, homeworkId }) => {
    const history = useHistory()

    return (
        <div className='task-table-item d-flex'>
            <div className='w-100 d-flex align-items-center'>
                <div className='overflow-hidden mr-2'>
                    <div>
                        <span className='text-semi-bold task-name mr-2'>
                            {task.name}
                        </span>

                        {task.taskType !== null && (
                            <Badge variant='secondary' style={{ backgroundColor: getTaskTypeColor(task.taskType.id) }}>
                                {task.taskType.name}
                            </Badge>
                        )}
                    </div>
                    <div>
                        <span className='text-description text-ellipsis' title={task.description?.replace(/<[^>]*>?/gm, '')}>
                            {task.description?.replace(/<[^>]*>?/gm, '')}
                        </span>
                    </div>
                </div>
                <div className='ml-auto'>
                    <Button variant='outline-primary' size='sm' onClick={() => history.push(`/homeworks/${homeworkId}/tasks/${task.id}`)}>
                        Перейти
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default HomeworkTaskList

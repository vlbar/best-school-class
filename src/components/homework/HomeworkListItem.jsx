import React, { useState } from 'react'
import { Button, Badge } from 'react-bootstrap'
import AnimateHeight from 'react-animate-height'
import { useHistory } from 'react-router-dom'

import { LoadingItem } from '../loading/LoadingList'
import { getTaskTypeColor } from './../tasks/TaskTypeDropdown'
import './HomeworkListItem.less'

let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }

const HomeworkListItem = ({ homework, onSelect, onClick, canExpandTasks }) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const history = useHistory()

    return (
        <div className='homework-list-item-container'>
            <div className='homework-list-item'>
                {canExpandTasks && (
                    <div className={'arrow' + (isExpanded ? ' expanded' : '')} onClick={() => setIsExpanded(!isExpanded)}>
                        <svg width='21' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M7 10l5 5 5-5z' />
                        </svg>
                    </div>
                )}
                <div className='w-100 d-flex flex-wrap justify-content-between'>
                    <div>
                        <div className='d-flex flex-wrap w-100'>
                            <div className='mr-2'>
                                <span className={onClick ? ' text-link' : ''} onClick={onClick && (() => onClick(homework))}>
                                    Домашнее задание (<span>{homework.tasks.length} {getCasedTask(homework.tasks.length)}</span>)
                                </span>
                            </div>
                            <div>
                                {Date.now() > homework.endingDate && (
                                    <Badge variant='secondary' className='y-auto'>
                                        Завершено
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className='d-flex flex-wrap text-muted text-description'>
                            <div className='mr-2'>
                                <div className='d-flex'>
                                    <div>
                                        <div className='select-group-circle mt-1' style={{ backgroundColor: homework.group.color ?? '#343a40' }} />
                                    </div>
                                    <b className='text-link' onClick={() => history.push(`groups/${homework.group.id}`)}>
                                        {homework.group.name}
                                    </b>
                                </div>
                            </div>
                            <div>
                                <span>
                                    <span>Срок: </span>
                                    {new Date(homework.openingDate).toLocaleString('ru-RU', options)}{' - '}
                                    {new Date(homework.endingDate).toLocaleString('ru-RU', options)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {Date.now() < homework.endingDate && onSelect && (
                        <div className='d-block'>
                            <Button variant='outline-primary' size='sm' className='mt-2' onClick={() => onSelect()}>
                                Изменить
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <AnimateHeight animateOpacity duration={220} height={isExpanded ? 'auto' : 0}>
                <div className='homework-list-item-tasks'>
                    {homework.tasks.map(task => {
                        return (
                            <div key={task.id} className='homework-list-item-task'>
                                <span className='mr-2'>{task.name}</span>
                                {task.taskType != null && (
                                    <Badge variant='secondary' style={{ backgroundColor: getTaskTypeColor(task.taskType.id) }}>
                                        {task.taskType.name}
                                    </Badge>
                                )}
                            </div>
                        )
                    })}
                </div>
            </AnimateHeight>
        </div>
    )
}

const getCasedTask = num => {
    if (num == 1) return 'задание'
    else if (num < 4) return 'задания'
    else return 'заданий'
}

export const FakeHomeworkListItem = ({ canExpandTasks }) => {
    return (
        <div className='homework-list-item-container'>
            <div className='fake-homework-list-item'>
                {canExpandTasks && (
                    <div className='arrow'>
                        <svg width='21' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                            <path d='M7 10l5 5 5-5z' />
                        </svg>
                    </div>
                )}
                <div className='w-100 d-flex flex-wrap justify-content-between'>
                    <div>
                        <div className='d-flex flex-wrap w-100'>
                            <LoadingItem width='240px' />
                        </div>
                        <div className='d-flex flex-wrap text-muted text-description'>
                            <div className='mr-2 mt-2'>
                                <LoadingItem width='120px' />
                            </div>
                            <div className='mt-2'>
                                <LoadingItem width='300px' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeworkListItem
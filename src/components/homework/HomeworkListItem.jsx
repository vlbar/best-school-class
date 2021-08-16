import React, { useState } from 'react'
import { Button, Badge } from 'react-bootstrap'
import AnimateHeight from 'react-animate-height'

import { LoadingItem } from '../loading/LoadingList'
import { getTaskTypeColor } from './../tasks/TaskTypeDropdown'
import './HomeworkListItem.less'
import { useHistory } from 'react-router-dom'

let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }

const HomeworkListItem = ({homework, onSelect, onClick, canExpandTasks}) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const history = useHistory()

    return (
        <div className='homework-list-item-container'>
            <div className='homework-list-item'>
                <div>
                    <div className='d-flex' style={{color: (Date.now() > homework.endingDate) && 'gray'}}>
                        {canExpandTasks && (
                            <div className={'arrow' + (isExpanded ? ' expanded':'')} onClick={() => setIsExpanded(!isExpanded)}>
                                <svg width='21' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                                    <path d='M7 10l5 5 5-5z'/>
                                </svg>
                            </div>
                        )}
                        <div className='d-flex' onClick={onClick && (() => onClick(homework))}>
                            <span className={onClick ? 'text-link':''}>Домашнее задание (<span>{homework.tasks.length} {getCasedTask(homework.tasks.length)}</span>)</span>
                            {(Date.now() > homework.endingDate) && <Badge variant='secondary' className='y-auto ml-2'>Завершено</Badge>}
                        </div>
                        {/*<div className='text-primary' title='У вас новое сообщение'>
                            <i className='fas fa-comment fa-xs p-2'></i>
                        </div>*/}
                    </div>
                    <div className={'text-muted text-description d-flex' + (canExpandTasks ? ' ml-4':'')}>
                        <div><div className='select-group-circle mt-1' style={{backgroundColor: homework.group.color ?? '#343a40'}}/></div>
                        <b className='text-link' onClick={() => history.push(`groups/${homework.group.id}`)}>
                            {homework.group.name}
                        </b>
                        <span className='ml-3'>
                            <span>Срок: </span>
                            {new Date(homework.openingDate).toLocaleString('ru-RU', options)} - {new Date(homework.endingDate).toLocaleString('ru-RU', options)}</span>
                    </div>
                </div>
                {(Date.now() < homework.endingDate && onSelect) && (
                    <div className='d-block'>
                        <Button variant='outline-primary' size='sm' className='mt-2' onClick={() => onSelect()}>Изменить</Button>
                    </div>
                )}
            </div>
            <AnimateHeight animateOpacity duration={220} height={isExpanded ? 'auto' : 0}>
                <div className='homework-list-item-tasks'>
                        {homework.tasks.map(task => {
                            return (
                                <div key={task.id} className='homework-list-item-task'>
                                    <span className='mr-2'>{task.name}</span>
                                    {(task.taskType != null) &&
                                        <Badge
                                            variant='secondary' 
                                            style={{backgroundColor: getTaskTypeColor(task.taskType.id)}}
                                        >
                                            {task.taskType.name}
                                        </Badge>
                                    }
                                </div>
                            )
                        })}
                    
                </div>
            </AnimateHeight>
        </div>
    )
}

const getCasedTask = (num) => {
    if(num == 1) 
        return 'задание'
    else if (num < 4)
        return 'задания'
    else return 'заданий'
}

export const FakeHomeworkListItem = ({canExpandTasks}) => {
    return (
        <div className='homework-list-item-container'>
            <div className='fake-homework-list-item'>
                <div className='d-flex'>
                    {canExpandTasks && (
                        <div className='arrow'>
                            <svg width='21' viewBox='0 0 24 24'  xmlns='http://www.w3.org/2000/svg'>
                                <path d='M7 10l5 5 5-5z'/>
                            </svg>
                        </div>
                    )}
                    <LoadingItem width='10%' className='mb-2' />
                </div>
                <div className={'text-muted text-description d-flex' + (canExpandTasks ? ' ml-4':'')}>
                    <LoadingItem width='20%' className='mr-3' />
                    <LoadingItem width='50%' />
                </div>
            </div>
        </div>
    )
}

export default HomeworkListItem
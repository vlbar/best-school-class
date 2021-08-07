import React, { useState } from 'react'
import { Button, Badge } from 'react-bootstrap'
import AnimateHeight from 'react-animate-height'

import { LoadingItem } from '../loading/LoadingList'
import { getTaskTypeColor } from './../tasks/TaskTypeDropdown'
import './HomeworkListItem.less'

let options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' }

const HomeworkListItem = ({homework, onSelect}) => {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className='homework-list-item-container'>
            <div className='homework-list-item'>
                <div>
                    <div className='d-flex' style={{color: (Date.now() > homework.endingDate) && 'gray'}}>
                        <div className={'arrow' + (isExpanded ? ' expanded':'')} onClick={() => setIsExpanded(!isExpanded)}>
                            <svg width='21' viewBox='0 0 24 24'  xmlns='http://www.w3.org/2000/svg'>
                                <path d='M7 10l5 5 5-5z'/>
                            </svg>
                        </div>
                        <div className='d-flex'>
                            <span>{homework.tasks.length} {getCasedTask(homework.tasks.length)}</span>
                            {(Date.now() > homework.endingDate) && <Badge variant='secondary' className='y-auto ml-2'>Завершено</Badge>}
                        </div>
                    </div>
                    <div className='ml-4 text-muted text-description d-flex'>
                        <div className='select-group-circle' style={{backgroundColor: homework.group.color ?? '#343a40'}}/><b>{homework.group.name}</b>
                        <span className='ml-3'><span>Срок: </span>{new Date(homework.openingDate).toLocaleString('ru-RU', options)} - {new Date(homework.endingDate).toLocaleString('ru-RU', options)}</span>
                    </div>
                </div>
                <div className='d-block'>
                    <Button variant='outline-primary' size='sm' className='mt-2' onClick={() => onSelect()}>
                        Выбрать    
                    </Button>
                </div>
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

export const FakeHomeworkListItem = () => {
    return (
        <div className='homework-list-item-container'>
            <div className='fake-homework-list-item'>
                <div className='d-flex'>
                    <div className='arrow'>
                        <svg width='21' viewBox='0 0 24 24'  xmlns='http://www.w3.org/2000/svg'>
                            <path d='M7 10l5 5 5-5z'/>
                        </svg>
                    </div>
                    <LoadingItem width='10%'/>
                </div>
                <div className='ml-4 text-muted text-description d-flex'>
                    <LoadingItem width='20%' className='mr-3'/>
                    <LoadingItem width='50%'/>
                </div>
            </div>
        </div>
    )
}

export default HomeworkListItem
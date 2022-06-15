import React, { useContext } from 'react'
import { Dropdown } from 'react-bootstrap'

import SortOrder from '../search/SortOrder'
import TaskTypeDropdown from './TaskTypeDropdown'
import { HomeworkContext } from '../homework/HomeworkBuilderContext'
import './TaskListHeader.less'

const orderBy = {
    'name-asc': 'По названию',
    'createdAt-desc': 'Сначала новые',
    'createdAt-asc': 'Сначала старые',
    'isCompleted-desc': 'По завершенности'
}

const TaskListHeader = ({submitSearchParams, selectedTasks, isSelectedAll, onSelectAll}) => {
    const onSelectType = (type) => {
        submitSearchParams({taskTypeId: type?.id})
    }

    const onSelectSort = (sort) => {
        submitSearchParams({orderBy: sort})
    }

    const { homework } = useContext(HomeworkContext)
    const addSelectedTasksToHomework = () => {
        homework.addTasks(selectedTasks)
    }

    return (
        <div className='task-list-header'>
            <input
                type='checkbox'
                className='task-checkbox'
                checked={isSelectedAll ?? false}
                onChange={() => onSelectAll()}
            />

            <div className={selectedTasks.length == 0 ? 'd-flex justify-content-end align-items-center' : 'none-parent'} style={{ width: '98%' }}>
                <TaskTypeDropdown
                    className='btn-clean mr-4'
                    onSelect={onSelectType}
                />
                <SortOrder
                    orders={orderBy}
                    initialOrder={'name-asc'}
                    onSelect={onSelectSort}
                    className='btn-clean'
                />
            </div>
            
            {(selectedTasks.length != 0) && 
                <>
                    <span className='selected-task-counter'>{selectedTasks.length} выделено</span>
                    <Dropdown className='dropdown-clean'>
                        <Dropdown.Toggle variant='white' id='dropdown-basic' className="p-0">Действие</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => addSelectedTasksToHomework()}>Добавить в домашнее</Dropdown.Item>
                            <Dropdown.Item>Переместить</Dropdown.Item>
                            <Dropdown.Item className='text-danger'>Удалить</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </>
            }
        </div>
    )
}

export default TaskListHeader

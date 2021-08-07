import React from 'react'
import { Dropdown } from 'react-bootstrap'
import SortOrder from '../search/SortOrder'
import TaskTypeDropdown from './TaskTypeDropdown'
import './TaskListHeader.less'

const orderBy = {
    'name-asc': 'По названию',
    'createDate-desc': 'Сначала новые',
    'createDate-asc': 'Сначала старые',
    'complete-asc': 'По завершенности'
}

const TaskListHeader = ({submitSearchParams, selectedTasksCount = 0, isSelectedAll, onSelectAll}) => {
    const onSelectType = (type) => {
        submitSearchParams({taskTypeId: type?.id})
    }

    const onSelectSort = (sort) => {
        submitSearchParams({orderBy: sort})
    }

    return (
        <div className='task-list-header'>
            <input
                type='checkbox'
                className='task-checkbox'
                checked={isSelectedAll ?? false}
                onChange={() => onSelectAll()}
            />

            <div className={selectedTasksCount == 0 ? 'd-flex justify-content-end w-100' : 'none-parent'}>
                <TaskTypeDropdown
                    className='btn-clean'
                    onSelect={onSelectType}
                />

                <SortOrder
                    orders={orderBy}
                    initialOrder={'name-asc'}
                    onSelect={onSelectSort}
                    className='btn-clean'
                />
            </div>
            
            {(selectedTasksCount != 0) && 
                <>
                    <span className='selected-task-counter'>{selectedTasksCount} выделено</span>
                    <Dropdown className='dropdown-clean'>
                        <Dropdown.Toggle variant='white' id='dropdown-basic'>Действие</Dropdown.Toggle>
                        <Dropdown.Menu>
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
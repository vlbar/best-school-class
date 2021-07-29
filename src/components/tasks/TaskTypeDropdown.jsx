import React, { useState, useEffect, useRef } from 'react'
import { Button, Dropdown, FormControl } from 'react-bootstrap'
import { addErrorNotification } from '../notifications/notifications'
import { LoadingList } from '../loading/LoadingList'
import { useInView } from 'react-intersection-observer'
import { TaskTypeAddUpdateModal } from './TaskTypeAddUpdateModal'
import { TaskTypeDeleteModal } from './TaskTypeDeleteModal'
import ProcessBar from '../process-bar/ProcessBar'
import axios from 'axios'
import './SearchTask.less'
import LazySearchInput from '../search/LazySearchInput'


const baseUrl = '/task-types'

async function fetch(page, size, name) {
    return axios.get(`${baseUrl}?page=${page}&size=${size}${name && `&name=${name}`}`)
}

async function add(taskType) {
    return axios.post(`${baseUrl}`, taskType)
}

async function update(taskType) {
    return axios.put(`${baseUrl}/${taskType.id}`, taskType)
}

async function remove(taskType) {
    return axios.delete(`${baseUrl}/${taskType.id}`)
}

const taskTypesColors = ['#69c44d', '#007bff', '#db4242', '#2cc7b2', '#8000ff', '#e68e29', '#d4d5d9', '#38c7d1']

export function getTaskTypeColor(id) {
    return taskTypesColors[id % taskTypesColors.length]
}

const TaskTypeDropdown = ({initialSelectedType, placeholder = 'Тип задания', onSelect, disabled}) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [taskTypes, setTaskTypes] = useState([])
    const [selectedType, setSelectedType] = useState(undefined)
    const [isFetching, setIsFetching] = useState(true)

    const [isDropdownShow, setIsDropdownShow] = useState(false)
    const dropdownLock = useRef(false)

    const [isAddTaskTypeModalShow, setIsAddTaskTypeModalShow] = useState(false)
    const [isDeleteTaskTypeModalShow, setIsDeleteTaskTypeModalShow] = useState(false)
    const [typeToUpdate, setTypeToUpdate] = useState(undefined)
    const [typeToDelete, setTypeToDelete] = useState(undefined)

    const emptyResultAfterName = useRef(undefined)
    const pagination = useRef({
        page: 1, 
        size: 10, 
        total: undefined,
        name: ''
    })

    const { ref, inView } = useInView({
        threshold: 1,
    })

    //auto fetch
    useEffect(() => {
        if(inView && !isFetching) fetchTypes(pagination.current.page + 1)
    }, [inView])

    //lazy initial select type
    useEffect(() => {
        if(initialSelectedType) { 
            setTaskTypes([initialSelectedType])
            setSelectedType(initialSelectedType)
        }
    }, [initialSelectedType])

    //dropdown
    const onDropdownToggle = (show) => {
        if(show && !isLoaded) fetchTypes(1)

        if(dropdownLock.current) {
            setIsDropdownShow(true)
        } else {
            setIsDropdownShow(show)
        }
    }

    const onSelectType = (typeId) => {
        let taskTypeId = undefined
        dropdownLock.current = false
        if(!selectedType || selectedType.id !== typeId)
            taskTypeId = typeId

        let targetType = taskTypes.find(x => x.id == taskTypeId)
        setSelectedType(targetType)
        onSelect(targetType)
    }

    //modals
    function showAddTaskTypeModal(taskType = undefined) {
        dropdownLock.current = true
        setIsAddTaskTypeModalShow(true)
        setTypeToUpdate(taskType)
    }

    const taskTypeAddUpdateSubmit = (taskType) => {
        if(!typeToUpdate)
            addType(taskType)
        else
            updateType(taskType)
    }

    const showDeleteTaskTypeModal = (taskType) => {
        dropdownLock.current = true
        setIsDeleteTaskTypeModalShow(true)
        setTypeToDelete(taskType)
    }

    //lock dropdown on modal show
    useEffect(() => {
        //а как иначе я просто не понимаю.....
        if(!(isAddTaskTypeModalShow || isDeleteTaskTypeModalShow)) 
            setTimeout(() => {
                dropdownLock.current = false
            }, 1);
    }, [isAddTaskTypeModalShow, isDeleteTaskTypeModalShow])

    //fetching
    const fetchTypes = (page) => {
        setIsFetching(true)
        setIsLoaded(false)
        
        fetch(page, pagination.current.size, pagination.current.name)
            .then(res => {
                let fetchedData = res.data

                pagination.current.page = page
                pagination.current.total = fetchedData.totalItems
                
                if(pagination.current.total == 0) emptyResultAfterName.current = pagination.current.name

                if(page == 1)
                    setTaskTypes(fetchedData.items)
                else
                    setTaskTypes([...taskTypes, ...fetchedData.items])
                setIsLoaded(fetchedData.items !== undefined)
            })
            .catch(error => addErrorNotification('Не удалось загрузить список типов. \n' + error))
            .finally(() => setIsFetching(false))
    }
    
    const addType = (taskType) => {
        setIsFetching(true)

        add(taskType)
            .then(res => {
                fetchTypes(1)
                setIsAddTaskTypeModalShow(false)
            })
            .catch(error => {
                addErrorNotification('Не удалось добавить тип работы, возможно, изменения не сохранятся. \n' + error)
                setIsFetching(false)
            })
    }

    const updateType = (taskType) => {
        setIsFetching(true)

        update(taskType)
            .then(res => {
                fetchTypes(1)
                setIsAddTaskTypeModalShow(false)
            })
            .catch(error => {
                addErrorNotification('Не удалось обновить тип работы, возможно, изменения не сохранятся. \n' + error)
                setIsFetching(false)
            })
    }

    const deleteType = (taskType) => {
        setIsFetching(true)

        remove(taskType)
            .then(res => {
                fetchTypes(1)
                setIsDeleteTaskTypeModalShow(false)
            })
            .catch(error => addErrorNotification('Не удалось обновить тип работы, возможно, изменения не сохранятся. \n' + error))
            .finally(() => setIsFetching(false))
    }

    return (
        <>
            <Dropdown show={isDropdownShow} onSelect={x => onSelectType(Number(x))} onToggle={onDropdownToggle} className='task-types-dropdown'>
                <Dropdown.Toggle variant='white' style={{borderColor: (selectedType ? getTaskTypeColor(selectedType.id) : '#ced4da')}} disabled={disabled}>
                    {selectedType ? selectedType.name : placeholder}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <div className='m-2'>
                        <LazySearchInput
                            autoFocus
                            className='w-100'
                            placeholder='Название для поиска...'
                            onChange={(e) => pagination.current.name = e.target.value}
                            onSubmit={() => fetchTypes(1)}
                            onEmpty={() => fetchTypes(1)}
                            onTimerStart={() => setIsFetching(true)}
                            emptyAfterValue={emptyResultAfterName.current}
                        />
                    </div>
                    <ProcessBar active={isFetching} height=".18Rem"/>
                    <ul className='task-type-list'>
                        {(isLoaded && taskTypes) ?
                            taskTypes.length > 0 ?
                                (taskTypes.map(taskType => {
                                    return (
                                        <div key={taskType.id} className={'task-type-item' + (((selectedType) && selectedType.id == taskType.id) ? ' selected':'')}>
                                            <Dropdown.Item eventKey={taskType.id}>
                                                {taskType.name}
                                            </Dropdown.Item>
                                            {taskType.creatorId !== null && 
                                                <>
                                                    <span className='task-type-action' onClick={() => showAddTaskTypeModal(taskType)} title='Изменить'>
                                                        <i className='fas fa-pen fa-xs'/>
                                                    </span>
                                                    <span className='task-type-action' onClick={() => showDeleteTaskTypeModal(taskType)} title='Удалить'>
                                                        <i className="fas fa-times fa-xs"/>
                                                    </span>
                                                </>
                                            }
                                        </div>
                                    )
                            }))
                            :   <div className='m-2'>
                                    <h6 className='text-center'>Ничего не найдено</h6>
                                    <p className='text-muted'>
                                        Не удалось найти типы, удовлетворяющие условиям поиска.
                                    </p>
                                </div>
                        :isFetching ?
                            <LoadingList widths={[40, 55, 45, 60]} className='mt-2' itemClassName='ml-4' itemMarginBottom='1.2Rem'/>
                            :   <div className='m-2'>
                                    <h6 className='text-center'>Произошла ошибка</h6>
                                    <p className='text-muted'>
                                        Не удалось загрузить список типов.
                                    </p>
                                </div>
                        }
                        {(isLoaded && pagination.current.page * pagination.current.size < pagination.current.total) &&
                            <button 
                                className="fetch-types-btn" 
                                onClick={() => fetchTypes(pagination.current.page + 1)} 
                                disabled={isFetching}
                                ref={ref}
                            >
                                {isFetching ? '. . .' : 'Загрузить еще'}
                            </button>
                        }
                    </ul>
                    <div className='m-2'>
                        <Button size='sm' variant='outline-secondary' className='w-100' onClick={() => showAddTaskTypeModal()}>
                            Добaвить
                        </Button>
                    </div>
                </Dropdown.Menu>
            </Dropdown>
            {isAddTaskTypeModalShow && <TaskTypeAddUpdateModal
                onClose={() => setIsAddTaskTypeModalShow(false)} 
                onSubmit={taskTypeAddUpdateSubmit}
                updatedTaskType={typeToUpdate}
            />}
            {isDeleteTaskTypeModalShow && <TaskTypeDeleteModal
                onClose={() => setIsDeleteTaskTypeModalShow(false)}
                onSubmit={deleteType}
                deletedTaskType={typeToDelete}
            />}
        </>
    )
}

export default TaskTypeDropdown
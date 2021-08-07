import React, { useState, useEffect, useRef } from 'react'
import { Button, Badge } from 'react-bootstrap'
import { addErrorNotification } from '../notifications/notifications'
import { TaskTypeAddUpdateModal } from './TaskTypeAddUpdateModal'
import { TaskTypeDeleteModal } from './TaskTypeDeleteModal'
import BestSelect, { BestItemSelector, BestSelectItem, BestSelectList, BestSelectToggle } from '../select/BestSelect'
import LazySearchInput from '../search/LazySearchInput'
import ProcessBar from '../process-bar/ProcessBar'
import axios from 'axios'
import './TaskTypeDropdown.less'

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

const TaskTypeDropdown = ({initialSelectedType, onSelect, placeholder = 'Тип задания', disabled, className}) => {
    // select
    const [taskTypes, setTaskTypes] = useState([])
    const [selectedType, setSelectedType] = useState(initialSelectedType)

    useEffect(() => {
        if(initialSelectedType) setSelectedType(initialSelectedType)
    }, [initialSelectedType])

    // fetching
    const [isFetching, setIsFetching] = useState(true)
    const pagination = useRef({
        page: 0, 
        size: 10, 
        total: undefined,
        name: ''
    })

    const scrollListRef = useRef()

    //searhing
    const emptyResultAfterName = useRef(undefined)

    // modals
    const [isAddTaskTypeModalShow, setIsAddTaskTypeModalShow] = useState(false)
    const [isDeleteTaskTypeModalShow, setIsDeleteTaskTypeModalShow] = useState(false)
    const [typeToUpdate, setTypeToUpdate] = useState(undefined)
    const [typeToDelete, setTypeToDelete] = useState(undefined)

    //modals
    function showAddTaskTypeModal(taskType = undefined) {
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
        setIsDeleteTaskTypeModalShow(true)
        setTypeToDelete(taskType)
    }

    // fetching
    const fetchTypes = () => {
        setIsFetching(true)
        pagination.current.page++
        
        fetch(pagination.current.page, pagination.current.size, pagination.current.name)
            .then(res => {
                let fetchedData = res.data
                pagination.current.total = fetchedData.totalItems
                if(pagination.current.total == 0) emptyResultAfterName.current = pagination.current.name

                if(pagination.current.page == 1)
                    setTaskTypes(fetchedData.items)
                else
                    setTaskTypes([...taskTypes, ...fetchedData.items])
            })
            .catch(error => addErrorNotification('Не удалось загрузить список типов. \n' + error))
            .finally(() => setIsFetching(false))
    }

    // searhing
    const searchType = (name) => {
        setTaskTypes([])
        scrollListRef.current.scrollTop = 0
        pagination.current.page = 0
        pagination.current.name = name
        fetchTypes()
    }
    
    // type requests
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
            <BestSelect
                disabled={disabled}
                onSelect={type => {
                    onSelect(type)
                    setSelectedType(type)
                }}
                initialSelectedItem={initialSelectedType}
                isDisableListClosing={isAddTaskTypeModalShow || isDeleteTaskTypeModalShow}
                className={'task-types-dropdown dropdown-clean' + ((className) ? ' ' + className:'')}
                toggle={(type) => {
                    return (
                        <BestSelectToggle className='d-flex align-items-center' >
                            <div className='type-color-circle' style={{backgroundColor: getTaskTypeColor(type?.id)}}/>
                            <span>{type ? type.name : placeholder}</span>
                        </BestSelectToggle>
                    )
                }}
            >
                <div className='m-2'>
                    <LazySearchInput
                        autoFocus
                        className='w-100'
                        placeholder='Название для поиска...'
                        onChange={(e) => pagination.current.name = e.target.value}
                        onSubmit={(value) => searchType(value)}
                        onEmpty={() => searchType('')}
                        onTimerStart={() => {
                            setIsFetching(true)
                            setTaskTypes([]) // гы гы га га
                        }}
                        emptyAfterValue={emptyResultAfterName.current}
                    />
                </div>
                {isFetching && <ProcessBar height=".18Rem"/>}
                <BestSelectList 
                    isFetching={isFetching}
                    isSearch={pagination.current.name.length > 0}
                    isCanFetchMore={pagination.current.page * pagination.current.size < pagination.current.total}
                    fetchItemsCallback={() => fetchTypes()}
                    scrollListRef={scrollListRef}
                >
                    {taskTypes.map(taskType => 
                        <BestSelectItem key={taskType.id} item={taskType}>
                            <BestItemSelector className='d-flex pl-2'>
                                <div className='type-color-circle' style={{backgroundColor: getTaskTypeColor(taskType.id)}}/>
                                <span>{taskType.name}</span>
                            </BestItemSelector>
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
                        </BestSelectItem>
                    )}
                </BestSelectList>
                <div className='m-2'>
                    <Button size='sm' variant='outline-secondary' className='w-100' onClick={() => showAddTaskTypeModal()}>
                        Добaвить
                    </Button>
                </div>
            </BestSelect>
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
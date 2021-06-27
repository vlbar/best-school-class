import React, { useState, useEffect, useRef } from 'react'
import { Button, Form, Dropdown, InputGroup, FormControl } from 'react-bootstrap'
import { addErrorNotification } from '../notifications/notifications'
import { LoadingList } from '../loading/LoadingList'
import { useInView } from 'react-intersection-observer'
import { TaskTypeAddUpdateModal } from './TaskTypeAddUpdateModal'
import { TaskTypeDeleteModal } from './TaskTypeDeleteModal'
import ProcessBar from '../process-bar/ProcessBar'
import axios from 'axios'
import './SearchTask.less'

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

export const SearchTask = ({onSubmit}) => {
    const [taskTypes, setTaskTypes] = useState(undefined)
    const [selectedTypeId, setSelectedTypeId] = useState(undefined)
    const [isFetching, setIsFetching] = useState(true)
    const [searchedTaskTypeName, setSearchedTaskTypeName] = useState('')
    const [isDropdownShow, setIsDropdownShow] = useState(false)
    const dropdownLock = useRef(false)

    const [isAddTaskTypeModalShow, setIsAddTaskTypeModalShow] = useState(false)
    const [isDeleteTaskTypeModalShow, setIsDeleteTaskTypeModalShow] = useState(false)
    const [typeToUpdate, setTypeToUpdate] = useState(undefined)
    const [typeToDelete, setTypeToDelete] = useState(undefined)

    const pagination = useRef({
        page: 1, 
        size: 10, 
        total: undefined,
        name: ''
    })

    const { ref, inView } = useInView({
        threshold: 1,
    });

    //auto fetch
    useEffect(() => {
        if(inView && !isFetching) fetchTypes(pagination.current.page + 1)
    }, [inView])

    //auto empty name cancel
    useEffect(() => {
        if(searchedTaskTypeName.length == 0 && pagination.current.name.length !== 0) fetchTypes(1)
    }, [searchedTaskTypeName])

    //lock dropdown on modal show
    useEffect(() => {
        //а как иначе я просто не понимаю.....
        if(!(isAddTaskTypeModalShow || isDeleteTaskTypeModalShow)) 
            setTimeout(() => {
                dropdownLock.current = false
            }, 1);
    }, [isAddTaskTypeModalShow, isDeleteTaskTypeModalShow])

    const onDropdownToggle = (show) => {
        if(show && !taskTypes) fetchTypes(1)

        if(dropdownLock.current) {
            setIsDropdownShow(true)
        } else {
            setIsDropdownShow(show)
        }
    }

    const onSelectType = (typeId) => {
        if(!selectedTypeId || selectedTypeId !== typeId)
            setSelectedTypeId(typeId)
        else
            setSelectedTypeId(undefined)
    }

    const fetchTypes = (page) => {
        setIsFetching(true)

        if(page == 1) {
            pagination.current.name = encodeURIComponent(searchedTaskTypeName.trim())
        }
        
        fetch(page, pagination.current.size, pagination.current.name)
            .then(res => {
                let fetchedData = res.data

                pagination.current.page = page
                pagination.current.total = fetchedData.totalItems
                
                if(page == 1)
                    setTaskTypes(fetchedData.items)
                else
                    setTaskTypes([...taskTypes, ...fetchedData.items])
            })
            .catch(error => addErrorNotification('Не удалось загрузить список типов. \n' + error))
            .finally(() => setIsFetching(false))
    }
    
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

    const addType = (taskType) => {
        setIsFetching(true)

        add(taskType)
            .then(res => {
                fetchTypes(1)
                setIsAddTaskTypeModalShow(false)
            })
            .catch(error => addErrorNotification('Не удалось добавить тип работы, возможно, изменения не сохранятся. \n' + error))
            .finally(() => setIsFetching(false))
    }

    const updateType = (taskType) => {
        setIsFetching(true)

        update(taskType)
            .then(res => {
                fetchTypes(1)
                setIsAddTaskTypeModalShow(false)
            })
            .catch(error => addErrorNotification('Не удалось обновить тип работы, возможно, изменения не сохранятся. \n' + error))
            .finally(() => setIsFetching(false))
    }

    const showDeleteTaskTypeModal = (taskType) => {
        dropdownLock.current = true
        setIsDeleteTaskTypeModalShow(true)
        setTypeToDelete(taskType)
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

    const searchKeyDown = (event) => {
        if(event.key == 'Enter') {
            if(searchedTaskTypeName.trim() !== pagination.current.name)
                fetchTypes(1)
        }
    }

    return (<>
        <div className='d-flex flex-row my-3'>        
            <InputGroup className='mr-2'>
                <Form.Control
                    type='text'
                    className='form-control'
                    placeholder='Введите название курса'
                    aria-describedby='basic-addon2'
                />
                <div className='input-group-append'>
                    <button className='btn btn-outline-secondary' type='button'><i className='fas fa-search'/></button>
                </div>
            </InputGroup>
            
            <Dropdown show={isDropdownShow} onSelect={onSelectType} onToggle={onDropdownToggle} className='task-types-dropdown'>
                <Dropdown.Toggle variant='best'>
                    {selectedTypeId ? taskTypes.find(x => x.id == selectedTypeId).name : 'Тип задания'}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <div className='m-2'>
                        <FormControl
                            autoFocus
                            className='w-100'
                            placeholder='Название для поиска...'
                            onChange={(e) => setSearchedTaskTypeName(e.target.value)}
                            value={searchedTaskTypeName}
                            onKeyPress={(e) => searchKeyDown(e)}
                            
                        />
                    </div>
                    <ProcessBar active={isFetching} height=".18Rem"/>
                    <ul className='task-type-list'>
                        {taskTypes ?
                            (taskTypes.map(taskType => {
                                return (
                                    <div key={taskType.id} className={'task-type-item' + ((selectedTypeId == taskType.id) ? ' selected':'')}>
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
                        :isFetching ?
                            <LoadingList widths={[40, 55, 45, 60]} className='mt-2' itemClassName='ml-4' itemMarginBottom='1.2Rem'/> :
                            <div className='m-2'>
                                <h6 className='text-center'>Произошла ошибка</h6>
                                <p className='text-muted'>
                                    Не удалось загрузить список типов.
                                </p>
                            </div>
                        }
                        {(taskTypes !== undefined && pagination.current.page * pagination.current.size < pagination.current.total) &&
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
        </div>
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
    </>)
}
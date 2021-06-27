import React, { useState, useEffect, useRef } from 'react'
import { Button, Form, Dropdown, InputGroup, FormControl } from 'react-bootstrap'
import { store } from 'react-notifications-component'
import { errorNotification } from '../notifications/notifications'
import { LoadingList } from '../loading/LoadingList'
import { useInView } from 'react-intersection-observer'
import ProcessBar from '../process-bar/ProcessBar'
import axios from 'axios'
import './SearchTask.less'

const baseUrl = '/task-types'

async function fetch(page, size, name) {
    return axios.get(`${baseUrl}?page=${page}&size=${size}${name && `&name=${name}`}`)
}

export const SearchTask = ({onSubmit}) => {
    const [taskTypes, setTaskTypes] = useState(undefined)
    const [selectedTypeId, setSelectedTypeId] = useState(undefined)
    const [isFetching, setIsFetching] = useState(true)
    const [searchedTaskTypeName, setSearchedTaskTypeName] = useState('')

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

    const onDropdownToggle = (show) => {
        if(show && !taskTypes) fetchTypes(1)
    }

    const onSelectType = (typeId) => {
        if(!selectedTypeId || selectedTypeId !== typeId)
            setSelectedTypeId(typeId)
        else
            setSelectedTypeId(undefined)
    }

    const fetchTypes = async (page) => {
        setIsFetching(true)

        if(page == 1) {
            pagination.current.name = encodeURIComponent(searchedTaskTypeName.trim())
        }
        
        await fetch(page, pagination.current.size, pagination.current.name)
            .then(res => {
                let fetchedData = res.data

                pagination.current.page = page
                pagination.current.total = fetchedData.totalItems
                
                if(page == 1)
                    setTaskTypes(fetchedData.items)
                else
                    setTaskTypes([...taskTypes, ...fetchedData.items])
            })
            .catch(error => {
                store.addNotification({
                    ...errorNotification,
                    message: 'Не удалось загрузить список курсов. \n' + error
                });
            })
            .finally(() => {
                setIsFetching(false)
            })
    }

    const searchKeyDown = (event) => {
        if(event.key == 'Enter') {
            if(searchedTaskTypeName.trim() !== pagination.current.name)
                fetchTypes(1)
        }
    }

    return (
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
            
            <Dropdown onSelect={onSelectType} onToggle={onDropdownToggle} className='task-types-dropdown'>
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
                                    <div key={taskType.id} className={'d-flex justify-content-between' + ((selectedTypeId == taskType.id) ? ' selected':'')}>
                                        <Dropdown.Item eventKey={taskType.id}>
                                            <span>{taskType.name}</span>
                                        </Dropdown.Item>
                                        {taskType.creatorId !== null && <span className='task-type-edit' onClick={() => console.log('edit')} title='Изменить'>
                                            <i className='fas fa-pen fa-xs'/>
                                        </span>}
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
                        <Button size='sm' variant='outline-secondary' className='w-100' onClick={() => setIsAddTaskTypeModalShow(true)}>
                            Добaвить
                        </Button>
                    </div>
                </Dropdown.Menu>
            </Dropdown>
        </div>)
}
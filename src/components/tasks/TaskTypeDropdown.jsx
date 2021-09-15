import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'

import { createError } from '../notifications/notifications'
import { TaskTypeAddUpdateModal } from './TaskTypeAddUpdateModal'
import { TaskTypeDeleteModal } from './TaskTypeDeleteModal'
import BestSelect, { BestItemSelector, BestSelectItem, BestSelectList, BestSelectToggle } from '../select/BestSelect'
import LazySearchInput from '../search/LazySearchInput'
import ProcessBar from '../process-bar/ProcessBar'
import Resource from '../../util/Hateoas/Resource'
import './TaskTypeDropdown.less'

const baseUrl = '/task-types'
const baseLink = Resource.basedOnHref(baseUrl).link()
const pageLink = baseLink.fill('size', 20)

const typeLink = (id) => { return Resource.basedOnHref(`${baseUrl}/${id}`).link() }

// colors
const taskTypesColors = ['#69c44d', '#007bff', '#db4242', '#2cc7b2', '#8000ff', '#e68e29', '#d4d5d9', '#38c7d1']
export function getTaskTypeColor(id) {
    return taskTypesColors[id % taskTypesColors.length]
}

const TaskTypeDropdown = ({initialSelectedType, onSelect, placeholder = 'Тип задания', disabled, className}) => {
    // select
    const [taskTypes, setTaskTypes] = useState(undefined)
    const [nextPage, setNextPage] = useState(undefined)
    const [isHasErrors, setIsHasErrors] = useState(false)

    const [selectedType, setSelectedType] = useState(initialSelectedType)

    useEffect(() => {
        if(initialSelectedType) setSelectedType(initialSelectedType)
    }, [initialSelectedType])

    // fetching
    const [isFetching, setIsFetching] = useState(true)
    const pagination = useRef({
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
    const [isInModalFetching, setIsInModalFetching] = useState(false)

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
    const fetchTypes = (link) => {
        link
            ?.fetch(setIsFetching)
            .then(res => {
                let types = res.list('taskTypes')
                setNextPage(res.link('next'))
                
                if(res.page.totalElements == 0) emptyResultAfterName.current = link.param('name')
                if(res.page.number == 1)
                    setTaskTypes(types)
                else
                    setTaskTypes([...taskTypes, ...types])
                setIsHasErrors(false)
            })
            .catch(error => {
                setIsHasErrors(true)
                createError('Не удалось загрузить список типов.', error)
            })
    }

    const onDropdownToggle = () => {
        if(taskTypes == undefined) fetchTypes(pageLink)
    }

    // searhing
    const searchType = (name) => {
        setTaskTypes(undefined)
        scrollListRef.current.scrollTop = 0
        fetchTypes(pageLink.fill('name', name))
    }
    
    // type requests
    const addType = (taskType) => {
        baseLink
            .post(taskType, setIsInModalFetching)
            .then(() => {
                fetchTypes(pageLink)
                setIsAddTaskTypeModalShow(false)
            })
            .catch(error => createError('Не удалось добавить тип работы, возможно, изменения не сохранятся.', error))
    }

    const updateType = (taskType) => {
        typeLink(taskType.id)
            .put(taskType, setIsInModalFetching)
            .then(() => {
                fetchTypes(pageLink)
                setIsAddTaskTypeModalShow(false)
            })
            .catch(error => createError('Не удалось обновить тип работы, возможно, изменения не сохранятся.', error))
    }

    const deleteType = (taskType) => {
        typeLink(taskType.id)
            .remove(setIsInModalFetching)
            .then(() => {
                fetchTypes(pageLink)
                setIsDeleteTaskTypeModalShow(false)
            })
            .catch(error => createError('Не удалось обновить тип работы, возможно, изменения не сохранятся.', error))
    }

    return (
        <>
            <BestSelect
                disabled={disabled}
                onSelect={type => {
                    onSelect(type)
                    setSelectedType(type)
                }}
                onDropdownToggle={onDropdownToggle}
                initialSelectedItem={initialSelectedType}
                isDisableListClosing={isAddTaskTypeModalShow || isDeleteTaskTypeModalShow}
                className={'minw-0 task-types-dropdown dropdown-clean' + ((className) ? (' ' + className):'')}
                toggle={(type) => {
                    return (
                        <BestSelectToggle className='minw-0 d-flex flex-row align-items-center mw-100'>
                            <div>
                                <div className='type-color-circle' style={{backgroundColor: getTaskTypeColor(type?.id)}}/>
                            </div>
                            <div className='minw-0 position-relative w-100'>
                                <div className='text-truncate'>
                                    <span>{type ? type.name : placeholder}</span>
                                </div>
                            </div>

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
                    isCanFetchMore={nextPage}
                    isCanAutoFetch={!isHasErrors}
                    fetchItemsCallback={() => fetchTypes(nextPage)}
                    scrollListRef={scrollListRef}
                >
                    {taskTypes && taskTypes.map(taskType => 
                        <BestSelectItem key={taskType.id} item={taskType}>
                            <BestItemSelector className='d-flex pl-2'>
                                <div><div className='type-color-circle' style={{backgroundColor: getTaskTypeColor(taskType.id)}}/></div>
                                <span className='text-truncate' title={taskType.name}>{taskType.name}</span>
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
                isFetching={isInModalFetching}
                updatedTaskType={typeToUpdate}
            />}
            {isDeleteTaskTypeModalShow && <TaskTypeDeleteModal
                onClose={() => setIsDeleteTaskTypeModalShow(false)}
                onSubmit={deleteType}
                isFetching={isInModalFetching}
                deletedTaskType={typeToDelete}
            />}
        </>
    )
}

export default TaskTypeDropdown
import React, { useState, useEffect, useRef } from 'react'
import { SearchTask } from './SearchTask'
import { Button, Table, Badge, Dropdown } from 'react-bootstrap'
import ProcessBar from '../process-bar/ProcessBar'
import { addErrorNotification } from '../notifications/notifications'
import { LoadingList } from '../loading/LoadingList'
import axios from 'axios'
import './TaskList.less'

const baseUrl = '/tasks'

async function fetch(courseId, page, size, name, taskTypeId) {
    return axios.get(`${baseUrl}?courseId=${courseId}&page=${page}&size=${size}${name !== undefined ? `&name=${name}`:''}${taskTypeId !== undefined ? `&taskTypeId=${taskTypeId}`:''}`)
}

const taskTypesColors = ['#69c44d', '#007bff', '#db4242', '#2cc7b2', '#8000ff', '#e68e29', '#d4d5d9', '#38c7d1']

export const TaskList = ({selectedCourse}) => {
    const [tasks, setTasks] = useState(undefined)
    const [isFetching, setIsFetching] = useState(false)

    const [filterTaskName, setFilterTaskName] = useState(undefined)
    const [filterTaskTypeId, setfilterTaskTypeId] = useState(undefined)

    const pagination = useRef({
        page: 1, 
        size: 20, 
        total: undefined,
        name: '',
        taskTypeId: undefined,
        courseId: undefined
    })

    useEffect(() => {
        if(selectedCourse) fetchTasks(1)
    }, [selectedCourse])

    const fetchTasks = (page) => {
        setIsFetching(true)

        if(page == 1) {
            setTasks(undefined)
            pagination.current.name = filterTaskName && encodeURIComponent(filterTaskName.trim())
            pagination.current.taskTypeId = filterTaskTypeId
            pagination.current.courseId = selectedCourse.id
        }

        fetch(pagination.current.courseId, page, pagination.current.size, pagination.current.name, pagination.current.taskTypeId)
            .then(res => {
                let fetchedData = res.data

                pagination.current.page = page
                pagination.current.total = fetchedData.totalItems
  
                if(page == 1)
                    setTasks(fetchedData.items)
                else
                    setTasks([...tasks, ...fetchedData.items])
            })
            .catch(error => addErrorNotification('Не удалось загрузить список типов. \n' + error))
            .finally(() => setIsFetching(false))
    }

    const getMessage = () => {
        if(!selectedCourse)
            return  <>
                        <h5>Не выбран курс</h5>
                        <p className='text-muted'>Выберите курс, чтобы отобразить его задания, либо воспользуйтесь поиском.</p>
                    </>
        else
            if(tasks) {
                if(tasks.length == 0)
                    return  <>
                                <h5>Увы, но задания еще не добавлены.</h5>
                                <p className='text-muted'>Не удалось загрузить список заданий.</p>
                            </>
            }
            else if(!isFetching)
                return  <>
                            <h5>Произошла ошибка</h5>
                            <p className='text-muted'>Не удалось загрузить список заданий.</p>
                        </>

        return undefined
    }

    let message = getMessage()
    return (
        <>
            <SearchTask/>
            <div className='task-list'>
                {isFetching && <ProcessBar className='position-absolute' height='.18Rem'/>}
                <div className='scroll-container'>
                    {tasks && tasks.length !== 0 && 
                        <div className='tasks-table'>
                        {tasks && tasks.map(task => {
                            return (
                                <div key={task.id} className='task-table-item'>
                                    <div className='d-flex justify-content-between'>
                                        <div>
                                            <span className='text-semi-bold'>{task.name}</span>
                                        
                                            {task.taskType !== null ?
                                                <Badge
                                                    className='ml-2'
                                                    variant='secondary' 
                                                    style={{backgroundColor: taskTypesColors[task.taskType.id % taskTypesColors.length]}}
                                                >
                                                    {task.taskType.name}
                                                </Badge>:''}
                                        </div>
                                    </div>
                                    <div className='w-100'>
                                        <span className='text-description text-ellipsis' title={task.description}>
                                            {task.description}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                        </div>
                    }
                    {(tasks !== undefined && !isFetching && pagination.current.page * pagination.current.size < pagination.current.total) &&
                        <button 
                            className="fetch-types-btn" 
                            onClick={() => fetchTasks(pagination.current.page + 1)} 
                            disabled={isFetching}
                        >
                            Загрузить еще
                        </button>
                    }
                    {message && <div className='task-message-container'>{message}</div>}
                    {isFetching &&
                        <Table bordered={false} className='tasks-table'>
                            <tbody>
                                <tr><td><LoadingList widths={[40, 80]} itemMarginLeft='0' itemMarginBottom='0.25Rem' itemStyle={{marginTop: '0.28Rem'}}/></td></tr>
                                <tr><td><LoadingList widths={[70, 60]} itemMarginLeft='0' itemMarginBottom='0.25Rem' itemStyle={{marginTop: '0.28Rem'}}/></td></tr>
                                <tr><td><LoadingList widths={[50, 90]} itemMarginLeft='0' itemMarginBottom='0.25Rem' itemStyle={{marginTop: '0.28Rem'}}/></td></tr>
                            </tbody>
                        </Table>}
                </div>
            </div>
            <Button 
                variant='primary' 
                className={'w-100 mt-2'} 
                onClick={() => openAddCourseModal()}
                disabled={!selectedCourse || !tasks}
            >Добавить задание</Button>
            
        </>)
}
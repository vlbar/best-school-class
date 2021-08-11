import React, { useState, useEffect, useRef, useContext } from 'react'
import { SearchTask } from './SearchTask'
import { Button, Table, Badge, Dropdown } from 'react-bootstrap'
import ProcessBar from '../process-bar/ProcessBar'
import { addErrorNotification } from '../notifications/notifications'
import { LoadingList } from '../loading/LoadingList'
import { TaskAddModal } from './TaskAddModal'
import { useHistory } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import TaskListHeader from './TaskListHeader'
import { HomeworkContext } from '../homework/HomeworkBuilderContext'
import axios from 'axios'
import './TaskList.less'

const baseUrl = '/tasks'

async function fetch(courseId, page, size, name, taskTypeId, order) {
    return axios.get(`${baseUrl}?page=${page}&size=${size}${courseId !== undefined ? `&courseId=${courseId}`:''}${name !== undefined ? `&name=${name}`:''}${taskTypeId !== undefined ? `&taskTypeId=${taskTypeId}`:''}${order !== undefined ? `&order=${order}`:''}`)
}

async function add(task) {
    return axios.post(`${baseUrl}`, task)
}

const taskTypesColors = ['#69c44d', '#007bff', '#db4242', '#2cc7b2', '#8000ff', '#e68e29', '#d4d5d9', '#38c7d1']

export const TaskList = ({selectedCourse}) => {
    // fetching
    const [tasks, setTasks] = useState(undefined)
    const [isFetching, setIsFetching] = useState(false)

    const pagination = useRef({
        page: 1, 
        size: 20, 
        total: undefined,
        name: '',
        taskTypeId: undefined,
        courseId: undefined,
        orderBy: 'name-asc'
    })

    // searching
    const emptyResultAfterTaskName = useRef(undefined)
    const searchParams = useRef({
        name: '',
        taskTypeId: undefined,
        orderBy: pagination.current.orderBy
    })

    useEffect(() => {
        if(selectedCourse) fetchTasks(1)
    }, [selectedCourse])

    //auto fetch
    const { ref, inView } = useInView({
        threshold: 1
    })

    useEffect(() => {
        if(inView && !isFetching) fetchTasks(pagination.current.page + 1)
    }, [inView])

    // select
    const [selectedTasks, setSelectedTasks] = useState([])

    const selectTask = (task) => {
        setSelectedTasks([...selectedTasks, task])
    }

    const unselectTask = (task) => {
        setSelectedTasks(selectedTasks.filter(x => x.id !== task.id))
    }

    const onSelectTaskHandler = (task) => {
        if(selectedTasks.find(x => x.id == task.id) == undefined)
            selectTask(task)
        else
            unselectTask(task)
    }
    
    const onSelectAll = () => {
        if(!tasks) return
        if(selectedTasks.length == tasks.length)
            setSelectedTasks([])
        else
            setSelectedTasks(tasks)
    }

    // homework
    const { homework } = useContext(HomeworkContext)

    // modals
    const [isAddTaskModalShow, setIsAddTaskModalShow] = useState(false)
    const [taskToAdd, setTaskToAdd] = useState(undefined)
    const [isTaskAdding, setIsTaskAdding] = useState(false)
    const history = useHistory()

    const setSearchParams = (params) => {
        searchParams.current = {...searchParams.current, ...params}
        if(searchParams.current.name.trim().length > 0)
            fetchTasks(1)
        else 
            if(selectedCourse) fetchTasks(1)
            else {
                setTasks(undefined)
                setIsFetching(false)
            }
    }

    const fetchTasks = (page) => {
        setIsFetching(true)

        if(page == 1) {
            setTasks(undefined)
            setSelectedTasks([])
            pagination.current.courseId = selectedCourse?.id
            pagination.current = {...pagination.current, ...searchParams.current}
        }

        fetch(pagination.current.courseId, page, pagination.current.size, pagination.current.name, pagination.current.taskTypeId, pagination.current.orderBy)
            .then(res => {
                let fetchedData = res.data

                pagination.current.page = page
                pagination.current.total = fetchedData.totalItems

                if(fetchedData.totalItems === 0) 
                    emptyResultAfterTaskName.current = pagination.current.name
  
                if(page == 1)
                    setTasks(fetchedData.items)
                else
                    setTasks([...tasks, ...fetchedData.items])
            })
            .catch(error => addErrorNotification('Не удалось загрузить список типов. \n' + error))
            .finally(() => setIsFetching(false))
    }

    const addTask = (task) => {
        task.courseId = selectedCourse.id
        task.maxScore = 100

        setIsTaskAdding(true)
        setTaskToAdd(task)

        add(task)
            .then(res => {
                let fetchedData = res.data
                history.push(`courses/${selectedCourse.id}/tasks/${fetchedData.id}`)
            })
            .catch(error => addErrorNotification('Не удалось добавить задание, возможно, изменения не сохранятся. \n' + error))
            .finally(() => setIsTaskAdding(false))
    }

    // ох уж эти индусы...
    const getMessage = () => {
        if(!selectedCourse && !tasks && !isFetching)
            return  <>
                        <h5>Не выбран курс</h5>
                        <p className='text-muted'>Выберите курс, чтобы отобразить его задания, либо воспользуйтесь поиском.</p>
                    </>
        else
            if(!isFetching)
                if(tasks) {
                    if(tasks.length == 0)
                        if(searchParams.current.name !== '' || searchParams.current.taskTypeId !== undefined)
                            return  <>
                                        <h5>Задания не найдены.</h5>
                                        <p className='text-muted'>Не удалось найти задания, удовлетворяющие условиям поиска.</p>
                                    </>
                        else return <>
                                        <h5>Увы, но задания еще не добавлены.</h5>
                                        <p className='text-muted'>Чтобы задания были в списке, для начали их нужно добавить.</p>
                                    </>
                }
                else
                    return  <>
                                <h5>Произошла ошибка</h5>
                                <p className='text-muted'>Не удалось загрузить список заданий.</p>
                            </>

        return undefined
    }

    let message = getMessage()
    return (
        <>
            <SearchTask 
                onSubmit={(params) => setSearchParams(params)}
                setIsFetching={(isFetching) => {
                    setIsFetching(isFetching)
                    setTasks([])
                }}
                emptyAfterTaskName={emptyResultAfterTaskName.current}
            />
            <TaskListHeader
                submitSearchParams={(params) => setSearchParams(params)}
                selectedTasks={selectedTasks}
                isSelectedAll={selectedTasks.length == tasks?.length && tasks != undefined && tasks.length !== 0}
                onSelectAll={onSelectAll}
            />
            <div className='task-list course-panel'>
                {isFetching && <ProcessBar className='position-absolute' height='.18Rem'/>}
                <div className='scroll-container'>
                    {tasks && tasks.length !== 0 && 
                        <div className='tasks-table'>
                            {(tasks) && tasks.map(task => {
                                return (
                                    <div key={task.id} className='task-table-item d-flex'>
                                        <input 
                                            type='checkbox'
                                            className='ml-1'
                                            style={{marginTop: '.4Rem'}}
                                            checked={selectedTasks.find(x => x.id == task.id) !== undefined}
                                            onChange={(e) => onSelectTaskHandler(task)}
                                        />
                                        
                                        <div className='ml-2' style={{width: '95%'}}>
                                            <div className='d-flex justify-content-between'>
                                                <div>
                                                    <span 
                                                        className='text-semi-bold task-name mr-2' 
                                                        onClick={() => history.push(`courses/${task.courseId}/tasks/${task.id}`)}
                                                    >                                           
                                                        {task.name}
                                                    </span>
                                                
                                                    {task.taskType !== null ?
                                                        <Badge
                                                            variant='secondary' 
                                                            style={{backgroundColor: taskTypesColors[task.taskType.id % taskTypesColors.length]}}
                                                        >
                                                            {task.taskType.name}
                                                        </Badge>:''}
                                                </div>
                                                
                                                <Dropdown className='dropdown-action-menu'>
                                                    <Dropdown.Toggle size='sm' id='dropdown-basic'>⋮</Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item onClick={() => history.push(`courses/${task.courseId}/tasks/${task.id}`)}>Изменить</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => homework.addTask(task)}>Добавить в домашнее</Dropdown.Item>
                                                        <Dropdown.Item>Переместить</Dropdown.Item>
                                                        <Dropdown.Item className='text-danger'>Удалить</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </div>
                                            <div className='w-100'>
                                                <span className='text-description text-ellipsis' title={task.description?.replace(/<[^>]*>?/gm, '')}>
                                                    {task.description?.replace(/<[^>]*>?/gm, '')}
                                                </span>
                                            </div>

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
                            ref={ref}
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
                disabled={!selectedCourse || !tasks}
                onClick={() => setIsAddTaskModalShow(true)}
            >
                Добавить задание
            </Button>
            {<TaskAddModal 
                show={isAddTaskModalShow} 
                onClose={() => setIsAddTaskModalShow(false)} 
                isFetching={isTaskAdding} 
                taskToAdd={taskToAdd}
                onSubmit={addTask}
            />}
        </>)
}
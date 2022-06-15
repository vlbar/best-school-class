import React, { useState, useEffect, useRef, useContext } from 'react'
import { Button, Table, Badge, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { IoAddOutline } from "react-icons/io5";

import ProcessBar from '../process-bar/ProcessBar'
import Resource from '../../util/Hateoas/Resource'
import TaskDeleteModal from './TaskDeleteModal'
import TaskListHeader from './TaskListHeader'
import { createError } from '../notifications/notifications'
import { HomeworkContext } from '../homework/HomeworkBuilderContext'
import { Link, useHistory } from 'react-router-dom'
import { LoadingList } from '../loading/LoadingList'
import { TaskAddModal } from './TaskAddModal'
import { useInView } from 'react-intersection-observer'
import './TaskList.less'
import { SearchTask } from './SearchTask';

const baseUrl = '/tasks'
const baseLink = Resource.basedOnHref(baseUrl).link()
const pageLink = baseLink.fill('size', 20)

const taskTypesColors = ['#69c44d', '#007bff', '#db4242', '#2cc7b2', '#8000ff', '#e68e29', '#d4d5d9', '#38c7d1']

export const TaskList = ({selectedCourse}) => {
    // fetching
    const [tasks, setTasks] = useState(undefined)
    const [nextPage, setNextPage] = useState(undefined)
    const [isHasFetchingErrors, setIsHasFetchingErrors] = useState(false)

    const [isFetching, setIsFetching] = useState(false)
    const emptyResultAfterName = useRef(undefined)

    // searching
    const emptyResultAfterTaskName = useRef(undefined)
    const searchParams = useRef({
        name: '',
        taskTypeId: null,
        orderBy: 'name-asc'
    })

    //auto fetch
    const { ref, inView } = useInView({
        threshold: 0
    })

    // homework
    const { homework } = useContext(HomeworkContext)

    // modals
    const [isAddTaskModalShow, setIsAddTaskModalShow] = useState(false)   
    const [isTaskAdding, setIsTaskAdding] = useState(false)
    
    const [isDeleteTaskModalShow, setIsDeleteTaskModalShow] = useState(false)
    const [taskToDelete, setTaskToDelete] = useState(undefined)
    const [isTaskDeleting, setIsTaskDeleting] = useState(false)
    const history = useHistory()

    useEffect(() => {
        if(selectedCourse) fetchFirstTasksPage()
        setSelectedTasks([])
    }, [selectedCourse])

    useEffect(() => {
        if(inView && !isFetching && !isHasFetchingErrors) fetchTasks(nextPage)
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
        if(selectedTasks.find(x => x.id == task.id) == undefined) selectTask(task)
        else unselectTask(task)
    }
    
    const onSelectAll = () => {
        if(!tasks) return
        if(selectedTasks.length == tasks.length) setSelectedTasks([])
        else setSelectedTasks(tasks)
    }

    const setSearchParams = (params) => {
        searchParams.current = {...searchParams.current, ...params}
        if(searchParams.current.name.trim().length > 0) fetchFirstTasksPage()
        else if(selectedCourse) fetchFirstTasksPage()
        else {
            setTasks(undefined)
            setIsFetching(false)
        }
    }

    const fetchFirstTasksPage = () => {
        fetchTasks(
            pageLink
                .fill('courseId', selectedCourse?.id ?? null)
                .fill('name', searchParams.current.name)
                .fill('taskTypeId', searchParams.current.taskTypeId ?? null)
                .fill('order', searchParams.current.orderBy)
        )
    }

    const fetchTasks = (link) => {
        link
            ?.fetch(setIsFetching)
            .then(data => {
                let fetchedTasks = data.list('tasks') ?? []
                setNextPage(data.link('next'))

                if(data.page.totalElements == 0) emptyResultAfterName.current = link.param('name')
                if(data.page.number == 1)
                    setTasks(fetchedTasks)
                else
                    setTasks([...tasks, ...fetchedTasks])
                setIsHasFetchingErrors(false)
            })
            .catch(error => {
                createError('Не удалось загрузить список заданий.', error)
                setIsHasFetchingErrors(true)
            })
    }

    const addTask = (task) => {
        task.courseId = selectedCourse.id

        baseLink
            .post(task, setIsTaskAdding)
            .then(data => {
                history.push(`courses/${selectedCourse.id}/tasks/${data.id}`)
            })
            .catch(error => createError('Не удалось добавить задание, возможно, изменения не сохранятся.', error))
    }

    const removeTask = (task) => {
        task.link()
            .remove(setIsTaskDeleting)
            .then(data => {
                fetchFirstTasksPage()
                setIsDeleteTaskModalShow(false)
            })
            .catch(error => createError('Не удалось добавить задание, возможно, изменения не сохранятся.', error))
    }

    const openRemoveTaskModal = (task) => {
        setIsDeleteTaskModalShow(true)
        setTaskToDelete(task)
    }

    // ох уж эти индусы...
    const getMessage = () => {
        if(!selectedCourse && !tasks && !isFetching && searchParams.current.name == '')
            return  <>
                        <h5>Не выбран раздел</h5>
                        <p className='text-muted'>Выберите раздел, чтобы отобразить его задания, либо воспользуйтесь поиском.</p>
                    </>
        else
            if(!isFetching)
                if(tasks !== undefined) {
                    if(tasks === null || tasks.length === 0)
                        if(searchParams.current.name !== '' || searchParams.current.taskTypeId !== null)
                            return  <>
                                        <h5>Задания не найдены.</h5>
                                        <p className='text-muted'>Не удалось найти задания, удовлетворяющие условиям поиска.</p>
                                    </>
                        else return <>
                                        <h5>Увы, но задания еще не добавлены.</h5>
                                        <p className='text-muted'>
                                            Чтобы задания были в списке, для начали их нужно <span className='hover-link' onClick={() => setIsAddTaskModalShow(true)}>добавить.</span>
                                        </p>
                                    </>
                }
                else return <>
                                <h5>Произошла ошибка</h5>
                                <p className='text-muted'>Не удалось загрузить список заданий.</p>
                            </>

        return undefined
    }

    let message = getMessage()
    return (
        <div className="course-content">
            <div className="d-flex justify-content-between align-items-baseline mb-2">
                <h4 className="mt-0 mb-2">Задания</h4>
                <Button
                    size="sm"
                    variant="primary"
                    disabled={!selectedCourse || !tasks}
                    onClick={() => setIsAddTaskModalShow(true)}
                    className='pr-3'
                >
                    <IoAddOutline size={18} /> Добавить
                </Button>
            </div>
            <div className="w-100 mb-2">
                <SearchTask 
                    onSubmit={(params) => setSearchParams(params)}
                    setIsFetching={(isFetching) => {
                        setIsFetching(isFetching)
                        setTasks([])
                    }}
                    emptyAfterTaskName={emptyResultAfterName.current}
                    placeholder="Поиск задания..."
                    className="w-100"
                    isFetching={isFetching}
                />
            </div>
            <div className='task-list'>
                <TaskListHeader
                    submitSearchParams={(params) => setSearchParams(params)}
                    selectedTasks={selectedTasks}
                    isSelectedAll={selectedTasks.length == tasks?.length && tasks != undefined && tasks.length !== 0}
                    onSelectAll={onSelectAll}
                />
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
                                                    <Link to={`courses/${task.courseId}/tasks/${task.id}`} className='text-semi-bold task-name mr-2'>{task.name}</Link>                                                   
                                                    {task.taskType !== null && (
                                                        <Badge
                                                            variant='secondary'
                                                            className='mr-2'
                                                            style={{backgroundColor: taskTypesColors[task.taskType.id % taskTypesColors.length]}}>
                                                            {task.taskType.name}
                                                        </Badge>
                                                    )}
                                                    {!task.isCompleted && (
                                                        <OverlayTrigger
                                                            placement={'top'}
                                                            overlay={<Tooltip id={`tooltip-top`}>Задание не завершено</Tooltip>}>
                                                            <i className='fas fa-pen fa-xs text-secondary' />
                                                        </OverlayTrigger>
                                                    )}
                                                </div>
                                                
                                                <Dropdown className='dropdown-action-menu'>
                                                    <Dropdown.Toggle size='sm' id='dropdown-basic'>⋮</Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item as={Link} to={`courses/${task.courseId}/tasks/${task.id}`}>Изменить</Dropdown.Item>
                                                        <Dropdown.Item onClick={() => homework.addTask(task)}>Добавить в домашнее</Dropdown.Item>
                                                        <Dropdown.Item>Переместить</Dropdown.Item>
                                                        <Dropdown.Item className='text-danger' onClick={() => openRemoveTaskModal(task)}>Удалить</Dropdown.Item>
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
                    {(!isFetching && nextPage) &&
                        <button 
                            className="fetch-types-btn" 
                            onClick={() => fetchTasks(nextPage)}
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
            <TaskAddModal 
                show={isAddTaskModalShow} 
                onClose={() => setIsAddTaskModalShow(false)} 
                isFetching={isTaskAdding}
                onSubmit={addTask}
            />
            {isDeleteTaskModalShow && <TaskDeleteModal
                taskToDelete={taskToDelete}
                onClose={() => setIsDeleteTaskModalShow(false)}
                isFetching={isTaskDeleting}
                onSubmit={removeTask}
            />}
        </div>)
}
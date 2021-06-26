import React, { useEffect, useState } from 'react'
import { store } from 'react-notifications-component'
import { Button } from 'react-bootstrap'
import { TreeHierarchy, treeToFlat, deleteNode } from '../hierarchy/TreeHierarchy'
import { CourseAddUpdateModal } from './CourseAddUpdateModal'
import { DeleteCourseModal } from './DeleteCourseModal'
import { LoadingCoursesList } from './LoadingCoursesList'
import axios from 'axios'
import './CourseHierarchy.less'
import { errorNotification } from '../notifications/notifications'
import ProcessBar from '../process-bar/ProcessBar'

const baseUrl = '/courses'

export const CourseHierarchy = ({onCourseSelect}) => {
    const [courses, setCourses] = useState(undefined)

    const [isAddCourseShow, setIsAddCourseShow] = useState(false)
    const [parentCourseIdToAdd, setParentCourseIdToAdd] = useState(undefined)
    const [courseToUpdate, setCourseToUpdate] = useState(undefined)
    const [courseToDelete, setCourseToDelete] = useState(undefined)
    const [isFetching, setIsFetching] = useState(true)

    const fetchCourses = async (node, page) => {
        setIsFetching(true)

        let coursePage = {
            page: page, 
            size: 20,
            total: undefined,
            items:[]
        }
        
        await axios.get(`${baseUrl}?page=${page}&size=${coursePage.size}`)
            .then(res => {
                let fetchedData = res.data
                let items = fetchedData.items
                items = items.map(x => {
                    return mapToNode(x)
                })

                coursePage.items = items
                coursePage.total = fetchedData.totalItems
            })
            .catch(error => {
                console.log(error)
                store.addNotification({
                    ...errorNotification,
                    message: 'Не удалось загрузить список курсов. \n' + error
                });
            })
            .finally(() => {
                setIsFetching(false)
            })

        return coursePage
    }

    const fetchSubCourses = async (node, page = 1) => {
        setIsFetching(true)

        let coursePage = {
            page: page, 
            size: 20,
            total: undefined,
            items:[]
        }
        await axios.get(`${baseUrl}/${node.id}/sub-courses?page=${page}&size=${coursePage.size}`)
            .then(res => {
                let fetchedData = res.data
                let items = fetchedData.items
                items = items.map(x => {
                    return mapToNode(x)
                })
                coursePage.items = items
                coursePage.total = fetchedData.totalItems
            })
            .catch(error => {
                console.log(error)
                store.addNotification({
                    ...errorNotification,
                    message: 'Не удалось загрузить список курсов. \n' + error
                });
            })
            .finally(() => {
                setIsFetching(false)
            })

        return coursePage
    }

    const moveCourse = (courseId, parentId, position) => {
        setIsFetching(true)

        let data = {
            parentId: parentId,
            position: position
        }
        axios.put(`${baseUrl}/${courseId}/position`, data)
            .then(res => {
                console.log('oh thats good')
            })
            .catch(error => {
                console.log(error)
                store.addNotification({
                    ...errorNotification,
                    message: 'Не удалось переместить курс, возможно изменения не сохранятся. \n' + error
                });
            })
            .finally(() => {
                setIsFetching(false)
            })
    }

    const courseAddUpdateSubmit = (course) => {
        if(courseToUpdate !== undefined)
            updateCourse(course)
        else
            addCourse(course)
    }

    const addCourse = async (course) => {
        setIsFetching(true)
        setIsAddCourseShow(false)
        
        if(parentCourseIdToAdd !== undefined) {
            course.parentCourseId = parentCourseIdToAdd.id
            course.position = 1
        } else {
            course.parentCourseId = null
            course.position = (courses.length > 0) 
                ? courses[courses.length - 1].position + 1
                : 1
        }

        axios.post(`${baseUrl}`,course)
            .then(async res => {
                course.id = res.data.id
                course.isEmpty = true

                let flatTreeData = treeToFlat(courses)
                if (course.parentCourseId !== null)
                {
                    let parentCourse = flatTreeData.find(x => x.id == course.parentCourseId)
                    if(!parentCourse.isFetched) {
                        parentCourse.child = await fetchSubCourses(parentCourse)
                        parentCourse.isFetched = true
                    } else {
                        let parentChilds = parentCourse.child
                        parentChilds.filter(x => x.position >= course.position).forEach(x => x.position++)
                        parentCourse.child = [mapToNode(course), ...parentChilds]
                    }

                    flatTreeData.find(x => x.id == course.parentCourseId).isExpanded = true //i love React <3
                    setCourses(flatTreeData.filter(x => x.parentId == null))                    
                } else {
                    setCourses([...courses, mapToNode(course)])
                }
            })
            .catch(error => {
                console.log(error)
                store.addNotification({
                    ...errorNotification,
                    message: 'Не удалось добавить курс, возможно изменения не сохранятся. ' + error
                });
            })
            .finally(() => {
                setIsFetching(false)
                course.name = ''
                course.id = null
            })
    }

    const updateCourse = (course) => {
        setIsFetching(true)
        setIsAddCourseShow(false)
        let putCourse = mapToCourse(course)
        axios.put(`${baseUrl}/${putCourse.id}`, putCourse)
            .then(res => {
                let flatTreeData = treeToFlat(courses)
                let courseInTree = flatTreeData.find(x => x.id == course.id)
                applyCourseChanges(courseInTree, course)
                setCourses(flatTreeData.filter(x => x.parentId == null))
            })
            .catch(error => {
                console.log(error)
                store.addNotification({
                    ...errorNotification,
                    message: 'Не удалось изменить курс, возможно изменения не сохранятся.\n' + error
                });
            })
            .finally(() => {
                setIsFetching(false)
            })
    }

    const openDeleteModal = (course) => {
        setCourseToDelete(course)
    }

    const deleteCourse = (course) => {
        

        setIsFetching(true)
        axios.delete(`${baseUrl}/${course.id}`)
            .then(res => {
                deleteNode(course, courses, setCourses)
            })
            .catch(error => {
                console.log(error)
                store.addNotification({
                    ...errorNotification,
                    message: 'Не удалось удалить курс, возможно изменеия не сохранятся.\n' + error
                });
            })
            .finally(() => {
                setIsFetching(false)
                setCourseToDelete(undefined)
            })
    }

    const onCourseSelectHandler = (node) => {
        onCourseSelect(mapToCourse(node))
    }

    const openAddCourseModal = (parentCourse) => {
        setCourseToUpdate(undefined)
        setParentCourseIdToAdd(parentCourse)
        setIsAddCourseShow(true)
    }

    const openUpdateCourseModal = (course) => {
        setCourseToUpdate(course)
        setIsAddCourseShow(true)
    }

    const mapToNode = (course) => {
        return {
            id: course.id,
            parentId: course.parentCourseId,
            name: course.name,
            position: course.position,
            isExapnded: false,
            isFetched: false,
            isEmpty: course.isEmpty,
            child: []
        }
    }

    const mapToCourse = (node) => {
        return {
            id: node.id,
            parentCourseId: node.parentId,
            name: node.name,
            position: node.position,
            isEmpty: node.isEmpty
        }
    }

    const applyCourseChanges = (course, updatedCourse) => {
        course.name = updatedCourse.name
    }

    return (
        <>
            <div className="course-hierarchy" id='viewport-use'>
                <ProcessBar active={isFetching} height=".18Rem"/>
                <TreeHierarchy
                    treeData={courses}
                    setTreeData={setCourses}
                    fetchNodesHandler={fetchCourses}
                    fetchSubNodesHandler={fetchSubCourses}
                    onNodeAdd={(node) => openAddCourseModal(node)}
                    onNodeMove={moveCourse}
                    onNodeUpdate={openUpdateCourseModal}
                    onNodeDelete={openDeleteModal}
                    onNodeClick={onCourseSelectHandler}
                />
                {courses 
                    ? courses.length == 0
                        && <div className='no-courses'>
                            <h5>Увы, но учебные курсы еще не добавлены.</h5>
                            <p className='text-muted'>
                                Чтобы погрузится в мир удобного ведения учебного плана и базы знаний, для начала вы должны <a onClick={() => openAddCourseModal()}>добавить курс</a>.
                            </p>
                        </div>
                    :isFetching
                    ?<LoadingCoursesList/>
                    :<div className='no-courses'>
                        <h5>Произошла ошибка.</h5>
                        <p className='text-muted'>
                            Не удалось загрузить список курсов, <a onClick={() => window.location.reload(false)}>перезагрузите страницу</a> или попробуйте позже.
                        </p>
                    </div>
                }
            </div>
            <Button 
                variant='primary' 
                className={'w-100 mt-2'} 
                onClick={() => openAddCourseModal()}
                disabled={!courses}
            >Добавить курс</Button>
            <CourseAddUpdateModal 
                show={isAddCourseShow} 
                onSubmit={courseAddUpdateSubmit} 
                onClose={() => setIsAddCourseShow(false)} 
                parentCourse={parentCourseIdToAdd}
                updatedCourse={courseToUpdate}
            />
            {courseToDelete && <DeleteCourseModal onSubmit={deleteCourse} deletedCourse={courseToDelete} onClose={() => setCourseToDelete(undefined)}/>}
        </>
    )
}


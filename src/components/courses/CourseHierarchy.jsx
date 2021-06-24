import React, { useEffect, useState } from 'react'
import { store } from 'react-notifications-component'
import { Button } from 'react-bootstrap'
import { TreeHierarchy, treeToFlat } from '../hierarchy/TreeHierarchy'
import { CourseAddModal } from './CourseAddModal'
import axios from 'axios'
import './CourseHierarchy.less'
import ProcessBar from '../process-bar/ProcessBar'

const baseUtl = '/course'

const errorNotification = {
    title: "Произошла ошибка",
    message: "Перезагрузите страницу, если ошибка повторится то попробуйте позже",
    type: "danger",
    insert: "top",
    container: "top-right",
    animationIn: ["animate__animated animate__fadeIn"],
    animationOut: ["animate__animated animate__fadeOut"],
    showIcon: true,
    dismiss: {
        duration: 15000,
        onScreen: true
    }
  };

export const CourseHierarchy = () => {
    const [courses, setCourses] = useState([])

    const [isAddCourseShow, setIsAddCourseShow] = useState(false)
    const [parentCourseIdToAdd, setParentCourseIdToAdd] = useState(undefined)
    const [isFetching, setIsFetching] = useState(false)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = () => {
        setIsFetching(true)
        axios.get(`${baseUtl}?size=100`)
            .then(res => {
                let items = res.data.items
                items = items.map(x => {
                    return mapToNode(x)
                })
                setCourses(items)
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
    }

    const fetchSubCourses = async (node) => {
        setIsFetching(true)

        let newNodes = []
        await axios.get(`${baseUtl}/${node.id}/subcourses`)
            .then(res => {
                let items = res.data.items
                items = items.map(x => {
                    return mapToNode(x)
                })
                newNodes = items
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

        return newNodes
    }

    const moveCourse = (courseId, parentId, position) => {
        setIsFetching(true)

        let data = {
            parentId: parentId,
            position: position
        }
        axios.put(`${baseUtl}/${courseId}/position`, data)
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

        axios.post(`${baseUtl}`,course)
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

    const deleteCourse = (course) => {
        setIsFetching(true)
        axios.delete(`${baseUtl}/${course.id}`)
            .then(res => {
                console.log('oh thats good')
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
            })
    }

    const openAddCourseModal = (parentCourse) => {
        setParentCourseIdToAdd(parentCourse)
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

    return (
        <>
            <div className="course-hierarchy">
                <ProcessBar active={isFetching} height=".18Rem"/>
                {(courses.length > 0) ?
                <TreeHierarchy
                    treeData={courses}
                    setTreeData={setCourses}
                    fetchDataHandler={fetchSubCourses}
                    onNodeAdd={(node) => openAddCourseModal(node)}
                    onNodeMove={moveCourse}
                    onNodeDelete={deleteCourse}
                />
                :''}
            </div>
            <Button variant='primary' className={'w-100 mt-2'} onClick={() => openAddCourseModal()}>Добавить курс</Button>
            <CourseAddModal 
                show={isAddCourseShow} 
                onSubmit={addCourse} 
                onClose={() => setIsAddCourseShow(false)} 
                parentCourse={parentCourseIdToAdd}
            />
        </>
    )
}


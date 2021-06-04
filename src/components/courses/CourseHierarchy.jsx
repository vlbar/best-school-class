import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { TreeHierarchy, treeToFlat } from '../hierarchy/TreeHierarchy'
import { CourseAddModal } from './CourseAddModal'
import axios from 'axios'
import './CourseHierarchy.less'

const baseUtl = '/course'

export const CourseHierarchy = () => {
    const [courses, setCourses] = useState([])

    const [isAddCourseShow, setIsAddCourseShow] = useState(false)
    const [parentCourseIdToAdd, setParentCourseIdToAdd] = useState(undefined)

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = () => {
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
            })
    }

    const fetchSubCourses = async (id) => {
        let newNodes = []
        await axios.get(`${baseUtl}/${id}/subcourse`)
            .then(res => {
                let items = res.data.items
                items = items.map(x => {
                    return mapToNode(x)
                })
                newNodes = items
            })
            .catch(error => {
                console.log(error)
            })

        return newNodes
    }

    const moveCourse = (courseId, parentId, position) => {
        axios.put(`${baseUtl}/${courseId}/position?parentId=${parentId}&position=${position}`)
            .then(res => {
                console.log('oh thats good')
            })
            .catch(error => {
                console.log(error)
            })
    }

    const addCourse = (course) => {
        setIsAddCourseShow(false)
        
        if(parentCourseIdToAdd !== undefined) {
            course.parentCourseId = parentCourseIdToAdd.id
            course.position = 1
        } else {
            course.parentCourseId = null
            course.position = courses[courses.length - 1].position + 1
        }

        axios.post(`${baseUtl}`,course)
            .then(res => {
                course.id = res.data

                let flatTreeData = treeToFlat(courses)
                if (course.parentCourseId !== null)
                {
                    let parentCourse = flatTreeData.find(x => x.id == course.parentCourseId)
                    parentCourse.isExpanded = true
                    let parentChilds = parentCourse.child
                    parentChilds = [mapToNode(course), ...parentChilds]
                    parentChilds.filter(x => x.position >= course.position).forEach(x => x.position++)
                    let newTree = flatTreeData.filter(x => x.parentId == null)
                    setCourses([...newTree])
                } else {
                    setCourses([...courses, mapToNode(course)])
                }
            })
            .catch(error => {
                console.log(error)
            })
    }

    const deleteCourse = (course) => {
        axios.delete(`${baseUtl}/${course.id}`)
            .then(res => {
                console.log('oh thats good')
            })
            .catch(error => {
                console.log(error)
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
            child: []
        }
    }

    return (
        <>
            <div className="course-hierarchy">
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


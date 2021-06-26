import React, { useState, useEffect, useRef } from 'react'
import { Button, Form } from 'react-bootstrap'
import ProcessBar from '../process-bar/ProcessBar'
import { TreeHierarchy } from '../hierarchy/TreeHierarchy'
import { LoadingCoursesList } from './LoadingCoursesList'
import { store } from 'react-notifications-component'
import axios from 'axios'
import { errorNotification } from '../notifications/Notifications'
import './SearchCourse.less'

const baseUrl = '/courses'

export const SearchCourse = ({onSearching, onCourseSelect}) => {
    const [courses, setCourses] = useState(undefined)
    const [isFetching, setIsFetching] = useState(true)
    const [isShowHierarhy, setIsShowHierarhy] = useState(true)

    const [isSearching, setIsSearching] = useState(false)
    const [courseName, setCourseName] = useState('')
    const [inputError, setInputError] = useState(undefined)
    const searchedCourseName = useRef('')

    useEffect(() => {
        if(courseName.length == 0) {
            setIsSearching(false)
            onSearching(false)
            setInputError(undefined)
        }

        if(courseName.length >= 3) {
            setInputError(undefined)
        }
    }, [courseName])

    const mapToNode = (course) => {
        return {
            id: course.id,
            parentId: course.parentCourseId,
            name: course.name,
            position: course.position,
            isExapnded: false,
            child: []
        }
    }

    const onSearch = () => {
        if(courseName.trim().length > 0) {
            if(courseName.trim() == searchedCourseName.current) return
            searchedCourseName.current = courseName.trim()
        }

        if(courseName.trim().length < 3) {
            setInputError('Слишком короткое название')
            if(courseName.trim().length == 0) setTimeout(() => {
                setInputError(undefined)
            }, 5000);
            return
        }

        onSearching(true)
        setIsSearching(true) 
        setIsShowHierarhy(false)   
        setCourses(undefined)

        //TODO: ну когда нибудь решыть бы это недоразумение :/
        setTimeout(() => {
            setIsShowHierarhy(true)
        }, 500);
    }

    const fetchCourses = async (parentCourse, page) => {
        setIsFetching(true)

        let coursePage = {
            page: page, 
            size: 20,
            total: undefined,
            items:[]
        }
        
        await axios.get(`${baseUrl}?name=${encodeURIComponent(courseName)}&page=${page}&size=${coursePage.size}`)
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

    const onCourseSelectHandle = (node) => {
        onCourseSelect(mapToCourse(node))
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

    const searchKeyPress = (event) => {
        if(event.key === 'Enter') {
            onSearch()
        }
    }

    return (
        <>
            <div className="input-group my-3">
                <Form.Control
                    type="text"
                    className="form-control"
                    placeholder="Введите название курса"
                    aria-label="Введите название курса"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    onKeyPress={(e) => searchKeyPress(e)}
                    isInvalid={inputError !== undefined}/>
                {inputError && <div className="invalid-tooltip">
                    {inputError}
                </div>}
                <div className="input-group-append">
                    <button className="btn btn-outline-secondary" type="button" onClick={onSearch}><i className="fas fa-search"/></button>
                </div>
            </div>

            {isSearching &&
                <>
                    <div className="search-course-hierarchy">
                        <ProcessBar active={isFetching} height=".18Rem" className='mb-2'/>
                        {isShowHierarhy && <TreeHierarchy
                            treeData={courses}
                            setTreeData={setCourses}
                            canNodeDrag={false}
                            fetchNodesHandler={fetchCourses}
                            onNodeClick={onCourseSelectHandle}
                        />}
                        {courses
                            ? courses.length == 0 &&
                                <div className='no-courses'>
                                    <h5>По вашему запросу ничего не найдено.</h5>
                                    <p className='text-muted'>
                                        Не удалось найти курсы, удовлетворяющие условиям поиска, попробуйте изменить запрос.
                                    </p>
                                </div>
                            :<LoadingCoursesList/>
                        }
                    </div>
                </>
            }
        </>
    )
}
import React, { useState, useRef } from 'react'
import { Button } from 'react-bootstrap'
import ProcessBar from '../process-bar/ProcessBar'
import { TreeHierarchy } from '../hierarchy/TreeHierarchy'
import { LoadingCoursesList } from './LoadingCoursesList'
import { createError } from '../notifications/notifications'
import './SearchCourse.less'
import LazySearchInput from '../search/LazySearchInput'
import Resource from '../../util/Hateoas/Resource'

const baseUrl = '/courses'
const baseLink = Resource.basedOnHref(baseUrl).link().fill('size', 20)

export const SearchCourse = ({onSearching, onCourseSelect, onAddClick, isAddDisabled}) => {
    const [courses, setCourses] = useState(undefined)
    const [nextPage, setNextPage] = useState(undefined)
    const [isFetching, setIsFetching] = useState(true)

    const [isSearching, setIsSearching] = useState(false)
    const [inputError, setInputError] = useState(undefined)
    const searchedCourseName = useRef('')

    const fetchCourses = (link) => {
        link
            .fill('name', searchedCourseName.current)
            .fetch(setIsFetching)
            .then(res => {
                let items = res.list('courses')
                setNextPage(res.link('next'))
                
                if(items) {
                    items = items.map(x => {
                        return mapToNode(x)
                    })

                    if(res.page.number > 1)
                        setCourses([...courses, ...items])
                    else
                        setCourses(items)
                } else {
                    setCourses([])
                }
            })
            .catch(error => {
                createError('Не удалось загрузить список курсов.', error)
            })
    }

    const onChange = (courseName) => {
        if(courseName.trim().length < 3) {
            setInputError('Слишком короткое название')
            if(courseName.trim().length == 0) setTimeout(() => {
                setInputError(undefined)
            }, 5000)
        } else {
            setInputError(undefined)

            onSearching(true)
            setIsSearching(true)
        }

        searchedCourseName.current = courseName
    }

    const onSearch = () => {
        if(searchedCourseName.current.length > 2) fetchCourses(baseLink) 
    }

    const onCourseSelectHandle = (node) => {
        onCourseSelect(mapToCourse(node))
    }

    return (
        <>
            <div className='d-flex flex-row my-3'>
                <div className='input-group'>
                    <LazySearchInput 
                        placeholder='Введите название курса'
                        onChange={(e) => onChange(e.target.value)}
                        onSubmit={onSearch}
                        onEmpty={() => {
                            setIsSearching(false)
                            onSearching(false)
                            setInputError(undefined)
                        }}
                        isInvalid={inputError !== undefined}
                    />
                    {inputError && <div className="invalid-tooltip">
                        {inputError}
                    </div>}
                </div>
                <Button 
                    variant='primary'
                    onClick={onAddClick}
                    disabled={isAddDisabled}
                >Добавить</Button>
            </div>

            {isSearching &&
                <>
                    <div className='search-course-hierarchy course-panel'>
                        <ProcessBar active={isFetching} height=".18Rem" className='mb-2'/>
                        <TreeHierarchy
                            treeData={courses}
                            setTreeData={setCourses}
                            canNodeDrag={false}
                            onNodeClick={onCourseSelectHandle}
                        />
                        {nextPage &&
                            <button className='fetch-nodes-btn' onClick={() => fetchCourses(nextPage)} disabled={isFetching}>
                                Загрузить еще
                            </button>
                        }
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
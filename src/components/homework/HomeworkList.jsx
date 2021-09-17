import React, { useState, useRef, useEffect } from 'react'
import HomeworkListHeader from './HomeworkListHeader'
import { useInView } from 'react-intersection-observer'

import HomeworkListItem, { FakeHomeworkListItem } from './HomeworkListItem'
import ProcessBar from '../process-bar/ProcessBar'
import Resource from '../../util/Hateoas/Resource'
import useSkipMountEffect from '../common/useSkipMountEffect'
import { createError } from '../notifications/notifications'
import { selectState } from '../../redux/state/stateSelector'
import { useSelector } from 'react-redux'
import './HomeworkList.less'

const baseUrl = '/homeworks'
const pageLink = Resource.basedOnHref(baseUrl).link().fill('size', 20)

const HomeworkList = ({ onSelect, onClick, canExpandTasks = true, ...props }) => {
    // fetching
    const [homeworks, setHomeworks] = useState(undefined)
    const [isFetching, setIsFetching] = useState(false)
    const [isHasFetchingErrors, setIsHasFetchingErrors] = useState(false)

    const { state } = useSelector(selectState)
    const searchParams = useRef({
        groupId: null,
        orderBy: 'openingDate-desc',
    })

    const [nextPage, setNextPage] = useState(undefined)
    const getFirstPage = () => { 
        return pageLink
            .fill('groupId', searchParams.current.groupId)
            .fill('order', searchParams.current.orderBy)
            .fill('role', state) 
    }

    //auto fetch
    const { ref, inView } = useInView({
        threshold: 0,
    })

    useEffect(() => {
        if (!homeworks) fetchHomeworks(getFirstPage())
    }, [])

    useSkipMountEffect(() => {
        setHomeworks([])
        fetchHomeworks(getFirstPage())
    }, [state])

    useSkipMountEffect(() => {
        if (inView && !isFetching && !isHasFetchingErrors) fetchHomeworks(nextPage)
    }, [inView])

    const onSelectFilterHandler = filter => {
        searchParams.current = { ...searchParams.current, ...filter }
        setHomeworks([])
        fetchHomeworks(getFirstPage())
    }

    let isSearching = searchParams.current.groupId != undefined

    const fetchHomeworks = link => {
        link?.fetch(setIsFetching)
            .then(data => {
                let fetchedHomeworks = data.list('homeworks') ?? []
                setNextPage(data.link('next'))

                if (data.page.number == 1) setHomeworks(fetchedHomeworks)
                else setHomeworks([...homeworks, ...fetchedHomeworks])
                setIsHasFetchingErrors(false)
            })
            .catch(error => {
                setIsHasFetchingErrors(true)
                createError('Не удалось загрузить список домашних работ.', error)
            })
    }

    const retryFetch = () => {
        fetchHomeworks(homeworks ? nextPage : getFirstPage())
    }

    return (
        <div {...props}>
            <HomeworkListHeader onSelectFilter={onSelectFilterHandler} />
            <div className='homework-list'>
                {isFetching && <ProcessBar height='.18Rem' className='position-absolute' />}
                <div className='scroll-container'>
                    {homeworks &&
                        homeworks.map(homework => {
                            return (
                                <HomeworkListItem
                                    key={homework.id}
                                    homework={homework}
                                    onSelect={onSelect && (() => onSelect(homework))}
                                    onClick={onClick && (() => onClick(homework))}
                                    canExpandTasks={canExpandTasks}
                                />
                            )
                        })}
                    {isFetching && (
                        <>
                            <FakeHomeworkListItem canExpandTasks={canExpandTasks} />
                            <FakeHomeworkListItem canExpandTasks={canExpandTasks} />
                        </>
                    )}
                    {(!isFetching && nextPage) && (
                        <button className='fetch-types-btn' onClick={() => fetchHomeworks(nextPage)} disabled={isFetching} ref={ref}>
                            Загрузить еще
                        </button>
                    )}
                    {!isFetching &&
                        (homeworks
                            ? homeworks.length === 0 &&
                              (isSearching ? (
                                  <div className='m-2 text-center'>
                                      <h6 className='mt-4'>Ничего не найдено</h6>
                                      <p className='text-muted'>По вашему запросу ничего не найдено.</p>
                                  </div>
                              ) : (
                                  <div className='m-2 text-center'>
                                      <h6 className='mt-4'>Ничего нет</h6>
                                      <p className='text-muted'>Еще ничего не добавлено.</p>
                                  </div>
                              ))
                            : !isSearching && (
                                  <div className='m-2 text-center'>
                                      <h6 className='mt-4'>Произошла ошибка</h6>
                                      <p className='text-muted'>
                                          Не удалось загрузить домашние работы.{' '}
                                          <span className='hover-link' onClick={() => retryFetch()}>
                                              Повторить попытку
                                          </span>
                                      </p>
                                  </div>
                              ))}
                </div>
            </div>
        </div>
    )
}

export default HomeworkList

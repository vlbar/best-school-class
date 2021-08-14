import React, { useState, useRef, useEffect } from 'react'
import HomeworkListHeader from './HomeworkListHeader'
import { useInView } from 'react-intersection-observer'
import axios from 'axios'

import ProcessBar from '../process-bar/ProcessBar'
import HomeworkListItem, { FakeHomeworkListItem } from './HomeworkListItem'
import { addErrorNotification } from '../notifications/notifications'
import './HomeworkList.less'

const baseUrl = '/homeworks'

async function fetch(page, size, groupId, order) {
    return axios.get(`${baseUrl}?page=${page}&size=${size}${groupId !== undefined ? `&groupId=${groupId}`:''}${order !== undefined ? `&order=${order}`:''}&r=t`)
}

const HomeworkList = ({onSelect}) => {
    // fetching
    const [homeworks, setHomeworks] = useState(undefined)
    const [isFetching, setIsFetching] = useState(false)

    const pagination = useRef({
        page: 0, 
        size: 10, 
        total: undefined,
        groupId: undefined,
        orderBy: 'openingDate-desc',
    })

    useEffect(() => {
        if(!homeworks) fetchHomeworks()
    }, [])

    //auto fetch
    const { ref, inView } = useInView({
        threshold: 1
    })

    useEffect(() => {
        if(inView && !isFetching) fetchHomeworks()
    }, [inView])


    const onSelectFilterHandler = (filter) => { 
        pagination.current = {...pagination.current, ...filter}
        pagination.current.page = 0
        fetchHomeworks()
    }

    const fetchHomeworks = () => {
        setIsFetching(true)
        pagination.current.page++

        if(pagination.current.page == 1) {
            setHomeworks(undefined)
        }

        fetch(pagination.current.page, pagination.current.size, pagination.current.groupId, pagination.current.orderBy)
            .then(res => {
                let fetchedData = res.data
                pagination.current.total = fetchedData.totalItems
                if(fetchedData.totalItems == 0) emptyResultAfterTaskName.current = pagination.current.name
  
                if(pagination.current.page == 1)
                    setHomeworks(fetchedData.items)
                else
                    setHomeworks([...homeworks, ...fetchedData.items])
            })
            .catch(error => addErrorNotification('Не удалось загрузить список домащних работ. \n' + error))
            .finally(() => setIsFetching(false))
    }

    return (
        <>
            <HomeworkListHeader onSelectFilter={onSelectFilterHandler}/>
            <div className='homework-list'>
                {isFetching && <ProcessBar height=".18Rem" className='position-absolute'/>}
                <div className='scroll-container'>
                    {homeworks && homeworks.map(homework => {
                        return (<HomeworkListItem key={homework.id} homework={homework} onSelect={() => onSelect(homework)}/>)
                    })}
                    {(isFetching) && <><FakeHomeworkListItem/><FakeHomeworkListItem/></> }
                    {(homeworks !== undefined && !isFetching && pagination.current.page * pagination.current.size < pagination.current.total) &&
                        <button 
                            className="fetch-types-btn" 
                            onClick={() => fetchHomeworks()} 
                            disabled={isFetching}
                            ref={ref}
                        >
                            Загрузить еще
                        </button>
                    }
                </div>
            </div>
        </>
    )
}

export default HomeworkList
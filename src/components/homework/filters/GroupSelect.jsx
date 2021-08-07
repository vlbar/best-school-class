import React, { useState, useRef } from 'react'
import BestSelect, { BestItemSelector, BestSelectItem, BestSelectList, BestSelectToggle } from '../../select/BestSelect'
import { addErrorNotification } from '../../notifications/notifications'
import axios from 'axios'
import ProcessBar from '../../process-bar/ProcessBar'
import LazySearchInput from '../../search/LazySearchInput'
import './GroupSelect.less'

const baseUrl = '/groups'

async function fetch(page, size, name) {
    return axios.get(`${baseUrl}?page=${page}&size=${size}${name.length > 0 ? `&name=${name}`:''}`)
}

const GroupSelect = ({onSelect}) => {
    const [isFetching, setIsFetching] = useState(true)
    const [groups, setGroups] = useState([
        {
            id: 2,
            name: 'mylove',
            color: '#32a852'
        },
        {
            id: 3,
            name: 'mylore',
            color: '#3244a8'
        },
        {
            id: 4,
            name: 'mypain',
            color: '#ad2f90'
        },
    ])

    const emptyResultAfterName = useRef(undefined)
    const scrollListRef = useRef()

    const pagination = useRef({
        page: 0, 
        size: 10, 
        total: undefined,
        name: ''
    })

    const fetchGroup = () => {
        setIsFetching(true)
        pagination.current.page++

        fetch(pagination.current.page, pagination.current.size, encodeURIComponent(pagination.current.name.trim()))
            .then(res => {
                let fetchedData = res.data

                pagination.current.total = fetchedData.totalItems             
                if(pagination.current.total == 0) emptyResultAfterName.current = pagination.current.name

                if(pagination.current.page == 1)
                    setGroups(fetchedData.items)
                else
                    setGroups([...groups, ...fetchedData.items])
            })
            .catch(error => addErrorNotification('Не удалось загрузить список типов. \n' + error))
            .finally(() => setIsFetching(false))
    }

    const searchGroup = (name) => {
        pagination.current.page = 0
        pagination.current.name = name ?? ''
        fetchGroup()
    }

    return (
        <BestSelect
            onSelect={onSelect}
            className='dropdown-clean'
            toggle={(group) => {
                return (
                    <BestSelectToggle className='d-flex align-items-center'>
                        {(group) && <div className='select-group-circle' style={{backgroundColor: group.color ?? '#343a40'}}/>}
                        <span>{group ? group.name : 'Класс'}</span>
                    </BestSelectToggle>
                )
            }}
        >
            <div className='m-2'>
                <LazySearchInput
                    autoFocus
                    className='w-100'
                    placeholder='Название для поиска...'
                    onSubmit={(value) => searchGroup(value)}
                    onEmpty={() => searchGroup('')}
                    onTimerStart={() => {
                        setIsFetching(true)
                        setGroups([])
                    }}
                    emptyAfterValue={emptyResultAfterName.current}
                />
            </div>
            {isFetching && <ProcessBar height=".18Rem"/>}
            <BestSelectList 
                isFetching={isFetching}
                isSearch={pagination.current.name.length > 0}
                isCanFetchMore={pagination.current.page * pagination.current.size < pagination.current.total}
                fetchItemsCallback={() => fetchGroup()}
                scrollListRef={scrollListRef}
            >
                {groups.map(group => 
                    <BestSelectItem key={group.id} item={group}>
                        <BestItemSelector className='d-flex pl-2'>
                            <div className='select-group-circle' style={{backgroundColor: group.color ?? '#343a40'}}/>
                            <span>{group.name}</span>
                        </BestItemSelector>
                    </BestSelectItem>
                )}
            </BestSelectList>
        </BestSelect>
    )
}

export default GroupSelect
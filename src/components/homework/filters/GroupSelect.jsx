import React, { useState, useRef } from 'react'
import BestSelect, { BestItemSelector, BestSelectItem, BestSelectList, BestSelectToggle } from '../../select/BestSelect'
import { addErrorNotification } from '../../notifications/notifications'
import axios from 'axios'
import ProcessBar from '../../process-bar/ProcessBar'
import LazySearchInput from '../../search/LazySearchInput'
import './GroupSelect.less'
import { TEACHER } from '../../../redux/state/stateActions'
import { useSelector } from 'react-redux'
import { selectState } from '../../../redux/state/stateSelector'

const baseUrl = '/groups'

async function fetch(page, size, name, roles) {
    return axios.get(`${baseUrl}?page=${page}&size=${size}${name.length > 0 ? `&name=${name}`:''}&roles=${roles}`)
}

const GroupSelect = ({onSelect, initialSelectedGroup, placeholder, ...props}) => {
    const [isFetching, setIsFetching] = useState(true)
    const [groups, setGroups] = useState(undefined)
    const state = useSelector(selectState);

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

        fetch(pagination.current.page, pagination.current.size, encodeURIComponent(pagination.current.name.trim()), state.state)
            .then(res => {
                let fetchedData = res.data

                pagination.current.total = fetchedData.page.totalElements             
                if(pagination.current.total == 0) emptyResultAfterName.current = pagination.current.name

                if(pagination.current.page == 1)
                    setGroups(fetchedData.list("groups"))
                else
                    setGroups([...groups, ...fetchedData.list("groups")])
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
            {...props}
            initialSelectedItem={initialSelectedGroup}
            className={(props.className ? props.className : 'dropdown-clean')}
            toggle={(group) => {
                return (
                    <BestSelectToggle className='d-flex align-items-center' size={props.size} variant={props.variant ? props.variant : 'white'}>
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
                    placeholder={placeholder ?? 'Название для поиска...'}
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
                {groups && groups.map(group => 
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
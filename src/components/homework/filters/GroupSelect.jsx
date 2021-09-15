import React, { useState, useRef } from 'react'

import BestSelect, { BestItemSelector, BestSelectItem, BestSelectList, BestSelectToggle } from '../../select/BestSelect'
import LazySearchInput from '../../search/LazySearchInput'
import ProcessBar from '../../process-bar/ProcessBar'
import Resource from '../../../util/Hateoas/Resource'
import { createError } from '../../notifications/notifications'
import './GroupSelect.less'

const baseUrl = '/groups'
const baseLink = Resource.basedOnHref(baseUrl).link()
const pageLink = baseLink.fill('size', 20)

const GroupSelect = ({onSelect, initialSelectedGroup, placeholder, ...props}) => {
    const [isFetching, setIsFetching] = useState(true)
    const [groups, setGroups] = useState(undefined)
    const [nextPage, setNextPage] = useState(undefined)

    const emptyResultAfterName = useRef(undefined)
    const scrollListRef = useRef()

    const pagination = useRef({
        name: ''
    })

    const fetchGroup = (link) => {
        link
            ?.fetch(setIsFetching)
            .then(data => {
                let fetchedGroups = data.list('groups') ?? []
                setNextPage(data.link('next'))      
                if(data.page.totalElements == 0) emptyResultAfterName.current = data.param?.('name')

                if(data.page.number == 1)
                    setGroups(fetchedGroups)
                else
                    setGroups([...groups, ...fetchedGroups])
            })
            .catch(error => createError('Не удалось загрузить список типов.', error))
    }

    const onDropdownToggleHandler = () => {
        if(groups == undefined) fetchGroup(pageLink)
    }

    const searchGroup = (name) => {
        setGroups(undefined)
        pagination.current.name = name ?? ''
        fetchGroup(pageLink.fill('name', name))
    }

    return (
        <BestSelect
            onSelect={onSelect}
            onDropdownToggle={onDropdownToggleHandler}
            {...props}
            initialSelectedItem={initialSelectedGroup}
            className={(props.className ? props.className : 'dropdown-clean')}
            toggle={(group) => {
                return (
                    <BestSelectToggle className='d-flex align-items-center mw-100' size={props.size} variant={props.variant ? props.variant : 'white'}>
                        {(group) && <div><div className='select-group-circle' style={{backgroundColor: group.color ?? '#343a40'}}/></div>}
                        <span className='text-truncate'>{group ? group.name : 'Класс'}</span>
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
                isCanFetchMore={nextPage}
                fetchItemsCallback={() => fetchGroup()}
                scrollListRef={scrollListRef}
            >
                {groups && groups.map(group => 
                    <BestSelectItem key={group.id} item={group}>
                        <BestItemSelector className='d-flex pl-2'>
                            <div>
                                <div className='select-group-circle' style={{backgroundColor: group.color ?? '#343a40'}}/>
                            </div>
                            <span>{group.name}</span>
                        </BestItemSelector>
                    </BestSelectItem>
                )}
            </BestSelectList>
        </BestSelect>
    )
}

export default GroupSelect
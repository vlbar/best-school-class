import React, { useState, useRef, useEffect } from 'react'

import BestSelect, { BestItemSelector, BestSelectItem, BestSelectList, BestSelectToggle } from '../../select/BestSelect'
import LazySearchInput from '../../search/LazySearchInput'
import ProcessBar from '../../process-bar/ProcessBar'
import Resource from '../../../util/Hateoas/Resource'
import { createError } from '../../notifications/notifications'
import { selectState } from '../../../redux/state/stateSelector'
import { useSelector } from 'react-redux'
import './GroupSelect.less'
import SerachBar from '../../search/SearchBar'

const baseUrl = '/groups'
const baseLink = Resource.basedOnHref(baseUrl).link()
const pageLink = baseLink.fill('size', 20)

const GroupSelect = ({onSelect, initialSelectedGroup, placeholder, ...props}) => {
    const [isFetching, setIsFetching] = useState(true)
    const [groups, setGroups] = useState(undefined)
    const [nextPage, setNextPage] = useState(undefined)

    const { state } = useSelector(selectState)
    const emptyResultAfterName = useRef(undefined)
    const scrollListRef = useRef()

    const pagination = useRef({
        name: ''
    })

    useEffect(() => {
        setGroups(undefined)
    }, [state])

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
        if(groups == undefined) fetchGroup(pageLink.fill('roles', state))
    }

    const searchGroup = (name) => {
        setGroups(undefined)
        pagination.current.name = name ?? ''
        fetchGroup(pageLink.fill('name', name))
    }

    return (
        <BestSelect
            onSelect={onSelect}
            isResetOnStateChange
            onDropdownToggle={onDropdownToggleHandler}
            {...props}
            initialSelectedItem={initialSelectedGroup}
            className={(props.className ? props.className : 'dropdown-clean')}
            toggle={(group) => {
                return (
                    <BestSelectToggle className='d-flex justify-content-between align-items-center w-100' size={props.size} variant={props.variant ? props.variant : 'white'}>
                        <div className="d-flex flex-row align-items-center">
                            {(group) && <div className='select-group-circle' style={{backgroundColor: group.color ?? '#343a40'}}/>}
                            <span className='text-truncate'>{group ? group.name : 'Группа'}</span>
                        </div>
                    </BestSelectToggle>
                )
            }}
        >
            <div className='mb-2 mx-2'>
                <SerachBar
                    autoFocus
                    className='w-100'
                    placeholder={placeholder ?? 'Поиск группы...'}
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
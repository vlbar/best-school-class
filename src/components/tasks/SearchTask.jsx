import React, { useState } from 'react'
import LazySearchInput from '../search/LazySearchInput'
import TaskTypeDropdown from './TaskTypeDropdown'
import './SearchTask.less'

export const SearchTask = ({onSubmit, setIsFetching, emptyAfterTaskName}) => {
    const [selectedType, setSelectedType] = useState(undefined)
    const [searchedTaskName, setSearchedTaskName] = useState('')

    const onSelectType = (type) => {
        setSelectedType(type)
        submitSearchParams({taskTypeId: type?.id})
    }

    const submitSearchParams = (forceParam) => {
        let params = {
            name: searchedTaskName,
            taskTypeId: selectedType?.id
        }

        if(forceParam) params = {...params, ...forceParam}
        onSubmit(params)
    }

    return (<>
        <div className='d-flex flex-row my-3'>        
            <LazySearchInput
                placeholder='Введите название курса'
                onChange={(value) => setSearchedTaskName(value)}
                onSubmit={(value) => submitSearchParams({name: value})}
                onEmpty={() => submitSearchParams({name: ''})}
                onTimerStart={() => setIsFetching(true)}
                emptyAfterValue={emptyAfterTaskName}
            />
            
            <TaskTypeDropdown onSelect={onSelectType}/>
        </div>
    </>)
}
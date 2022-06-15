import React, { useState } from 'react'
import LazySearchInput from '../search/LazySearchInput'
import './SearchTask.less'
import useBestValidation from './edit/useBestValidation'
import SerachBar from '../search/SearchBar'
import Spinner from 'react-spinner-material'

//validation
const searchValidationSchema = {
    name: {
        type: 'string',
        nullable: true,
        min: [3, 'Слишком короткое название']
    }
}

export const SearchTask = ({onSubmit, setIsFetching, emptyAfterTaskName, isFetching}) => {
    const [searchedTaskName, setSearchedTaskName] = useState('')
    const searchValidation = useBestValidation(searchValidationSchema)

    const submitSearchParams = (forceParam) => {
        let params = {
            name: searchedTaskName
        }

        if(forceParam) params = {...params, ...forceParam}
        if(searchValidation.validate(params))
            onSubmit(params)
    }

    let nameValdiationErros = searchValidation.errors.name
    return (<>
        <div className='d-flex flex-row w-100'>        
            <SerachBar
                name='name'
                placeholder='Поиск задания...'
                autoComplete='off'
                onChange={(e) => {
                    searchValidation.blurHandle(e)
                    setSearchedTaskName(e.target.value)
                }}
                canSubmit={!nameValdiationErros}
                onTimerStart={(name) => { if(searchValidation.validate({name}) && name.trim().length > 0) setIsFetching(true) }}
                onSubmit={(value) => submitSearchParams({name: value})}
                onEmpty={() => submitSearchParams({name: ''})}
                emptyAfterValue={emptyAfterTaskName}
                className="w-100"
            >
                {nameValdiationErros && <div className='invalid-tooltip'>
                    {nameValdiationErros}
                </div>}
                {isFetching && <div className="mr-3">
                    <Spinner radius={21} color="#298AE5" stroke={2} visible={true} />
                </div>}
            </SerachBar>
        </div>
    </>)
}
import React, { useState } from 'react'
import LazySearchInput from '../search/LazySearchInput'
import './SearchTask.less'
import useBestValidation from './edit/useBestValidation'

//validation
const searchValidationSchema = {
    name: {
        type: 'string',
        nullable: true,
        min: [3, 'Слишком короткое название']
    }
}

export const SearchTask = ({onSubmit, setIsFetching, emptyAfterTaskName}) => {
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
        <div className='d-flex flex-row my-3'>        
            <LazySearchInput
                name='name'
                placeholder='Введите название задания'
                autoComplete='off'
                onChange={(e) => {
                    searchValidation.blurHandle(e)
                    setSearchedTaskName(e.target.value)
                }}
                isCanSubmit={!nameValdiationErros}
                isInvalid={nameValdiationErros}
                onTimerStart={(name) => { if(searchValidation.validate({name}) && name.trim().length > 0) setIsFetching(true) }}
                onSubmit={(value) => submitSearchParams({name: value})}
                onEmpty={() => submitSearchParams({name: ''})}
                emptyAfterValue={emptyAfterTaskName}
            >
                {nameValdiationErros && <div className='invalid-tooltip'>
                    {nameValdiationErros}
                </div>}
            </LazySearchInput>
        </div>
    </>)
}
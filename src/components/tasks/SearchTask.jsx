import React, { useState } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
import TaskTypeDropdown from './TaskTypeDropdown'
import './SearchTask.less'

export const SearchTask = ({onSubmit}) => {
    const [selectedType, setSelectedType] = useState(undefined)
    const [searchedTaskName, setSearchedTaskName] = useState('')

    const onSelectType = (type) => {
        setSelectedType(type)
        submitSearchParams({taskTypeId: type?.id})
    }

    const searchTaskKeyDown = (event) => {
        if(event.key == 'Enter') {
            submitSearchParams()
        }
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
            <InputGroup className='mr-2'>
                <Form.Control
                    placeholder='Введите название курса'
                    onKeyPress={(e) => searchTaskKeyDown(e)}
                    onChange={(e) => setSearchedTaskName(e.target.value)}
                    value={searchedTaskName}
                />
                <div className='input-group-append'>
                    <Button variant='outline-secondary' onClick={() => submitSearchParams()}><i className='fas fa-search'/></Button>
                </div>
            </InputGroup>
            
            <TaskTypeDropdown onSelect={onSelectType}/>
        </div>
    </>)
}
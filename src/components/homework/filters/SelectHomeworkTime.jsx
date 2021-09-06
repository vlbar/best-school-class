import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap'

const ALL = 'Все'
const UPCUMMING = 'Предстоящие'
const CURRENT = 'Текущие'
const COMPLETED = 'Завершенные'

const filterBy = [ALL, UPCUMMING, CURRENT, COMPLETED]

const SelectHomeworkTime = ({onSelect}) => {
    const [selectedType, setSelectedType] = useState(ALL)

    const onSelectHandler = (key) => {
        setSelectedType(key)
        const template = {
            minOpeningDate: undefined,
            maxOpeningDate: undefined,
            minClosingDate: undefined,
            maxClosingDate: undefined
        }

        switch (key) {
            case ALL:
                onSelect(template)
                break;
            case UPCUMMING:
                onSelect({ ...template, minOpeningDate: Date.now() })
            case CURRENT:
                onSelect({ ...template, maxOpeningDate: Date.now(), minClosingDate: Date.now() })
            case COMPLETED:
                onSelect({ ...template, maxClosingDate: Date.now() })
            default:
                break;
        }
    }

    return (
        <Dropdown className='dropdown-clean'>
            <Dropdown.Toggle variant='white'>
                {selectedType}
            </Dropdown.Toggle>
        
            <Dropdown.Menu>
                {filterBy.map(key => {
                    return (
                        <Dropdown.Item key={key} onClick={() => onSelectHandler(key)}>{key}</Dropdown.Item>
                    )
                })}
            </Dropdown.Menu>
        </Dropdown>
    )
}

export default SelectHomeworkTime
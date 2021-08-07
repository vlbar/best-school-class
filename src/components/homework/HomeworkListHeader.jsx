import React from 'react'

import SortOrder from '../search/SortOrder'
import GroupSelect from './filters/GroupSelect'
import SelectHomeworkTime from './filters/SelectHomeworkTime'
import './HomeworkListHeader.less'

const orderBy = {
    'openingDate-asc': 'Сначала позднейшие',
    'openingDate-desc': 'Сначала ранние'
}

const HomeworkListHeader = ({onSelectFilter}) => {
    const onSelectGroup = (group) => {
        onSelectFilter({groupId: group?.id})
    }

    const onSelectSort = (sort) => {
        onSelectFilter({orderBy: sort})
    }

    const onSelectTimer = (filterBy) => {
        onSelectFilter(filterBy)
    }

    return (
        <div className='homework-list-header justify-content-between'>
            <GroupSelect
                onSelect={onSelectGroup}
            />
            <div className='d-flex'>
                <SelectHomeworkTime
                    onSelect={onSelectFilter}
                />
                <SortOrder
                    title='Сортировка'
                    orders={orderBy}
                    initialOrder={'openingDate-asc'}
                    onSelect={onSelectTimer}
                    className='btn-clean'
                />
            </div>
        </div>
    )
}

export default HomeworkListHeader
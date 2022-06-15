import React from 'react'

import SortOrder from '../search/SortOrder'
import GroupSelect from './filters/GroupSelect'
import './HomeworkListHeader.less'

const orderBy = {
    'openingDate-asc': 'Сначала ранние',
    'openingDate-desc': 'Сначала поздние'
}

const HomeworkListHeader = ({onSelectFilter}) => {
    const onSelectGroup = (group) => {
        onSelectFilter({groupId: group?.id ?? null})
    }

    const onSelectSort = (sort) => {
        onSelectFilter({orderBy: sort})
    }

    return (
        <div className={'homework-list-header'}>
            <GroupSelect
                onSelect={onSelectGroup}
            />
            <SortOrder
                title='Сортировка'
                orders={orderBy}
                initialOrder={'openingDate-desc'}
                onSelect={onSelectSort}
                className='btn-clean mr-2'
            />
        </div>
    )
}

export default HomeworkListHeader
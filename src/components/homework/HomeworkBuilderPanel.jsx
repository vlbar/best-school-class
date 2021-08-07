import React, { useState } from 'react'
import { Alert, Button } from 'react-bootstrap'

import SelectHomeworkModal from './SelectHomeworkModal'
import './HomeworkBuilderPanel.less'

const HomeworkBuilderPanel = () => {
    const [isHomeworkSelectShow, setIsHomeworkSelectShow] = useState(false)

    const onSelectHomeworkHamdler = (homework) => {
        console.log(homework)
    }

    return (
        <>
            <Alert variant='primary' className='mt-3 d-flex justify-content-between'>
                <div>
                    <span className='text-semi-bold'>Домашнее задание</span><br/>           
                    <span style={{fontSize: '14px'}}>Объединятйе выбранные задания в домашнее и назначайте их выполнение студентам группы на определнное время</span>
                </div>
                <div className='align-self-center'>
                    <Button size='sm' variant='outline-primary' onClick={() => setIsHomeworkSelectShow(true)}>
                        Начать
                    </Button>
                </div>
            </Alert>

            <SelectHomeworkModal show={isHomeworkSelectShow} onSelect={onSelectHomeworkHamdler} onClose={() => setIsHomeworkSelectShow(false)}/>
        </>
    )
}

export default HomeworkBuilderPanel
import axios from 'axios'
import React, { useState, useRef, useEffect } from 'react'
import { addErrorNotification } from '../../../notifications/notifications'
import ProcessBar from '../../../process-bar/ProcessBar'
import { answersPartUrl } from '../AnswerContext'
import QuestionAnswer from './QuestionAnswer'

const questionsPartUrl = 'questions'

async function fetch(answerId, role) {
    return axios.get(`/${answersPartUrl}/${answerId}/${questionsPartUrl}?size=20&r=${role[0]}`)
}

const QuestionAnswerList = ({ answerId, role = 'student', readOnly = false }) => {
    const [isFetching, setIsFetching] = useState(false)
    const [taskAnswerQuestions, setTaskAnswerQuestions] = useState(undefined)

    const pagination = useRef({
        page: 0,
        size: 20,
        total: undefined,
    })

    useEffect(() => {
        fetchQuestions()
    }, [])

    const fetchQuestions = () => {
        setIsFetching(true)
        pagination.current.page++

        fetch(answerId, role)
            .then(res => {
                let fetchedData = res.data
                setTaskAnswerQuestions(fetchedData.items)
            })
            .catch(error => addErrorNotification('Не удалось загрузить список вопросов. \n' + error))
            .finally(() => setIsFetching(false))
    }

    return (
        <>
            {isFetching && <ProcessBar height='.18Rem' className='mt-2'/>}
            {taskAnswerQuestions &&
                taskAnswerQuestions.map((questionAnswer, index) => {
                    return <QuestionAnswer key={questionAnswer.id} index={index} taskQuestionAnswer={questionAnswer} readOnly={readOnly} />
                })}
        </>
    )
}

export default QuestionAnswerList

import React, { useState, useRef, useEffect } from 'react'
import { addErrorNotification } from '../../../notifications/notifications'
import ProcessBar from '../../../process-bar/ProcessBar'
import QuestionAnswer from './QuestionAnswer'

const QuestionAnswerList = ({ answerId, role = 'student', progress, setTaskAnswerQuestionsHandle, setQuestionAnswers, readOnly = false, questionsLink }) => {
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
        questionsLink
            .fetch(setIsFetching)
            .then(data => {
                setTaskAnswerQuestions(data.list('questions'))
            })
            .catch(error => addErrorNotification('Не удалось загрузить список вопросов. \n' + error))
    }

    const setQuestionAnswer = (questionAnswer) => {
        let targetTaskAnswerQuestions = taskAnswerQuestions
        let targetQuestionAnswer = targetTaskAnswerQuestions.find(x => x.id === questionAnswer.questionId)
        targetQuestionAnswer.questionAnswer = questionAnswer
        setTaskAnswerQuestions(targetTaskAnswerQuestions)
        if(setTaskAnswerQuestionsHandle) setTaskAnswerQuestionsHandle(targetTaskAnswerQuestions)
        if(setQuestionAnswers) setQuestionAnswers(targetTaskAnswerQuestions.map(x => x.questionAnswer))
    }

    return (
        <div className='mt-2'>
            {isFetching && <ProcessBar height='.18Rem' className='mt-2'/>}
            {taskAnswerQuestions &&
                taskAnswerQuestions.map((questionAnswer, index) => {
                    return <QuestionAnswer key={questionAnswer.id} index={index} taskQuestionAnswer={questionAnswer} setQuestionAnswer={setQuestionAnswer} progress={progress} readOnly={readOnly} />
                })}
        </div>
    )
}

export default QuestionAnswerList

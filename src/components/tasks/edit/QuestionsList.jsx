import React, { useState, useEffect, useRef } from 'react'
import { Button } from 'react-bootstrap'
import { sortableContainer, sortableElement, arrayMove } from 'react-sortable-hoc'
import { TaskQuestion } from './TaskQuestion'
import { tasksBaseUrl } from './TaskEditor'
import { LoadingList } from '../../loading/LoadingList'
import ProcessBar from '../../process-bar/ProcessBar'
import axios from 'axios'
import './TaskEditor.less'

export const QuestionContext = React.createContext()

// sortable hoc
const SortableContainer = sortableContainer(({children}) => <div>{children}</div>)
const SortableItem = sortableElement(({index_, question}) => (
    <TaskQuestion index={index_} question={question} />
))

//requests
export const questionPartUrl = 'questions'
async function fetchQuestions(taskId, page, size) {
    return axios.get(`${tasksBaseUrl}/${taskId}/${questionPartUrl}?page=${page}&size=${size}`)
}

export const QuestionsList = ({taskId}) => {
    const [isQuestionsFetching, setIsQuestionsFetching] = useState(false)
    const [questions, setQuestions] = useState(undefined)
    const [questionToChange, setQuestionToChange] = useState(null)

    const pagination = useRef({
        page: 1, 
        size: 10, 
        total: undefined
    })

    useEffect(() => {
        fetchTaskQuestions(1)
        return () => { }
    }, [])

    const fetchTaskQuestions = (page) => {
        setIsQuestionsFetching(true)
        fetchQuestions(taskId, page, pagination.current.size)
            .then(res => {
                let fetchedData = res.data
                let items = fetchedData.items

                pagination.current.page = page
                pagination.current.total = fetchedData.totalItems

                if(page == 1)
                    setQuestions(items)
                else
                    setQuestions([...questions, ...items])
            })
            .catch(error => 
                addErrorNotification('Не удалось загрузить информацию о задании. \n' + (error?.response?.data ? error.response.data.message : error))
            )
            .finally(() => {
                setIsQuestionsFetching(false)
            })
    }

    const moveQuestion = ({oldIndex, newIndex}) => {
        if(newIndex < 0 || newIndex > questions.length - 1 ||
           oldIndex < 0 || oldIndex > questions.length - 1) return
        let toPosition = questions[newIndex].position
        let movedQuestion = questions[oldIndex]

        let movedQuestions = questions
        movedQuestions.filter(x => x.position >= toPosition).forEach(x => x.position++)
        movedQuestions = arrayMove(movedQuestions, oldIndex, newIndex)
        movedQuestion.position = toPosition
        setQuestions([...movedQuestions])
    }

    const deleteQuestion = (question) => {
        let targetQuestions = questions
        let targetIndex = targetQuestions.findIndex(x => x.id == question.id)
        targetQuestions.splice(targetIndex, 1)
        setQuestions(targetQuestions)
    }

    const addQuestionAfter = (position) => {
        let targetQuestions = questions
        targetQuestions.filter(x => x.position >= position).forEach(x => x.position++)

        let newQuestion = {
            id: Math.random(),
            detached: true,
            position: position,
            maxScore: 1
        }

        let targetIndex = targetQuestions.findIndex(x => x.position >= position)
        if(targetIndex < 1)
            targetQuestions.push(newQuestion)
        else
            targetQuestions.splice(targetIndex, 0, newQuestion)

        setQuestions(targetQuestions)
    }

    const getMessage = () => {
        if(questions) {
            if(questions.length == 0)
                return  <>
                            <h5>Увы, но вопросы еще не добавлены.</h5>
                            <p className='text-muted'>Чтобы вопросы были в списке, для начали их нужно добавить.</p>
                        </>
        } else
            if(!isQuestionsFetching)
            return  <>
                        <h5>Произошла ошибка</h5>
                        <p className='text-muted'>Не удалось загрузить список вопросов задания.</p>
                    </>

        return undefined
    }

    let message = getMessage()
    return (
        <>
            {(questions !== undefined) &&
                <QuestionContext.Provider value={{taskId, questionToChange, setQuestionToChange, addQuestionAfter, moveQuestion, deleteQuestion}}>
                    <SortableContainer onSortEnd={moveQuestion} useDragHandle>
                        {questions.map((question, index) => (
                            <SortableItem key={question.id} index={index} index_={index + 1} question={question}/>
                        ))}
                    </SortableContainer>
                </QuestionContext.Provider>}
            {(questions !== undefined && !isQuestionsFetching && pagination.current.page * pagination.current.size < pagination.current.total) &&
                <button 
                    className="fetch-types-btn mb-2" 
                    onClick={() => fetchTaskQuestions(pagination.current.page + 1)} 
                    disabled={isQuestionsFetching}
                >
                    Загрузить еще
                </button>
            }
            {(isQuestionsFetching) &&
                <ProcessBar height='.18Rem' className='mb-2'/>
            }
            {(isQuestionsFetching) &&
                <LoadingList widths={[100, 100]} itemHeight='240px' itemMarginLeft='0'/>    
            }
            {message && <div className='task-message-container'>{message}</div>}
            <Button 
                variant='outline-primary mb-4' 
                className='w-100'
                onClick={() => addQuestionAfter(questions[questions.length - 1]?.position + 1 || 1)}
                disabled={isQuestionsFetching}
            >
                Добавить
            </Button>
        </>
    )
}
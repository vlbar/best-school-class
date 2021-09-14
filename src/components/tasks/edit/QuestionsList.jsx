import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { sortableContainer, sortableElement, arrayMove } from 'react-sortable-hoc'
import { useInView } from 'react-intersection-observer'

import { createError } from '../../notifications/notifications'
import { TaskQuestion } from './TaskQuestion'
import { LoadingList } from '../../loading/LoadingList'
import ProcessBar from '../../process-bar/ProcessBar'
import './TaskEditor.less'

export const QuestionsContext = React.createContext()

// sortable hoc
const SortableContainer = sortableContainer(({children}) => <div>{children}</div>)
const SortableItem = sortableElement(({index_, question, questionsLink}) => (
    <TaskQuestion index={index_} question={question} questionsLink={questionsLink} />
))

export const QuestionsList = ({ questionsLink }) => {  
    const [questions, setQuestions] = useState(undefined)
    const [questionToChange, setQuestionToChange] = useState(null)

    const [isFetching, setIsFetching] = useState(false)
    const [nextPage, setNextPage] = useState(undefined)
    const [isHasFetchingErrors, setIsHasFetchingErrors] = useState(false)

    const { ref, inView } = useInView({
        threshold: 0
    })

    useEffect(() => {
        if(inView && !isFetching && !isHasFetchingErrors) fetchTaskQuestions(nextPage)
    }, [inView])

    useEffect(() => {
        fetchTaskQuestions(questionsLink)
    }, [])

    const fetchTaskQuestions = (link) => {
        link
            ?.fill('size', 20)
            .fetch(setIsFetching)
            .then(data => {
                let fetchedQuestions = data.list('questions') ?? []
                setNextPage(data.link('next'))

                if(data.page.number == 1)
                    setQuestions(fetchedQuestions)
                else
                    setQuestions([...questions, ...fetchedQuestions])
                setIsHasFetchingErrors(false)
            })
            .catch(error => {
                setIsHasFetchingErrors(true)
                createError('Не удалось загрузить список заданий.', error)
            })
    }

    const moveQuestion = ({oldIndex, newIndex}) => {
        let toPosition = questions[newIndex].position
        let movedQuestion = questions[oldIndex]

        let movedQuestions = questions
        if(newIndex > oldIndex)
            for(let i = oldIndex + 1; i <= newIndex; i++) movedQuestions[i].position--
        else
            for(let i = newIndex; i < oldIndex; i++) movedQuestions[i].position++

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
            id: undefined,
            key: Math.random(),
            detached: true,
            position: position,
            maxScore: 1
        }

        let targetIndex = targetQuestions.findIndex(x => x.position >= position)
        if(targetIndex < 0)
            targetQuestions.push(newQuestion)
        else
            targetQuestions.splice(targetIndex, 0, newQuestion)

        setQuestionToChange(targetIndex >= 0 ? targetIndex : targetQuestions.length)
        setQuestions([...targetQuestions])
    }

    const setQuestion = (question, index) => {
        let targetQuestions = questions
        targetQuestions[index - 1] = question
        setQuestions([...targetQuestions])
    }

    const getMessage = () => {
        if(questions) {
            if(questions.length == 0)
                return  <>
                            <h5>Увы, но вопросы еще не добавлены.</h5>
                            <p className='text-muted'>Чтобы вопросы были в списке, для начали их нужно добавить.</p>
                        </>
        } else
            if(!isFetching)
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
                <QuestionsContext.Provider value={{ questionToChange, setQuestionToChange, setQuestion, addQuestionAfter, moveQuestion, deleteQuestion }}>
                    <SortableContainer onSortEnd={moveQuestion} useDragHandle>
                        {questions.map((question, index) => (
                            <SortableItem key={question.key ?? question.id} index={index} index_={index + 1} question={question} questionsLink={questionsLink} />
                        ))}
                    </SortableContainer>
                </QuestionsContext.Provider>}
            {(nextPage && !isFetching) &&
                <button 
                    className="fetch-types-btn mb-2" 
                    onClick={() => fetchTaskQuestions(nextPage)}
                    ref={ref}
                >
                    Загрузить еще
                </button>
            }
            {(isFetching) &&
                <>
                    <ProcessBar height='.18Rem' className='mb-2'/>
                    <LoadingList widths={[100, 100]} itemHeight='240px' itemMarginLeft='0'/>    
                </>
            }
            {message && <div className='task-message-container'>{message}</div>}
            <Button 
                variant='outline-primary mb-4' 
                className='w-100'
                onClick={() => addQuestionAfter(questions[questions.length - 1]?.position + 1 || 1)}
                disabled={isFetching || !questions || nextPage}
            >
                Добавить
            </Button>
        </>
    )
}
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
import { sortableHandle } from 'react-sortable-hoc'
import { QuestionVariant } from './QuestionVariant'
import './TaskQuestion.less'

const DragHandle = sortableHandle(() => <button className='icon-btn' title='Переместить'><i className='fas fa-grip-lines fa-lg'></i></button>)

export const TaskQuestion = ({question, questionToEdit, questionToEditHadnle}) => {
    const [isHover, setIsHover] = useState(false)

    const [selectedVariant, setSelectedVariant] = useState(0)
    const [questionVariants, setQuestionVariants] = useState([
        {
            id: 621,
            formulation: '5 Who is dangeon master?',
            position: 1,
            questionId: 612,
            numberOfSymbols: 555,
            type: 'TEXT_QUESTION'
        },
        {
            id: 622,
            formulation: 'Who is dangeon master?',
            position: 2,
            questionId: 612,
            numberOfSymbols: 555,
            type: 'TEXT_QUESTION'
        },
        {
            id: 623,
            formulation: 'Who is test master?',
            position: 2,
            questionId: 612,
            numberOfSymbols: 555,
            isMultipleAnswer: false,
            testAnswerVariants: [
                {
                    id: 618,
                    answer: "Van darkholme",
                    isRight: true
                },
                {
                    id: 619,
                    answer: "Relation slave",
                    isRight: false
                },
                {
                    id: 620,
                    answer: "Java Master",
                    isRight: false
                }
            ],
            type: 'TEST_QUESTION'
        }
    ])

    const pushNewVariant = () => {
        let questionVariantsVar = questionVariants
        questionVariantsVar.push({
            id: undefined,
            formulation: '',
            position: questionVariantsVar.length,
            questionId: question.id,
            numberOfSymbols: undefined,
            type: 'TEXT_QUESTION'
        })

        setQuestionVariants([...questionVariantsVar])
    }


    const onQuestionEdit = () => {
        questionToEditHadnle(question)
    }

    let isEditing = (questionToEdit ? questionToEdit.id == question.id : false)
    return (
        <div>
            <div className={'question-card' + (isHover || isEditing ? ' hover':'') + (isEditing ? ' edit':'')} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)}>
                <div className='question-card-header'>
                    <div>
                        <DragHandle />
                        {questionVariants.map((variant, index) => 
                            <Button
                                key={index}
                                size='sm' 
                                variant={selectedVariant == index ? 'outline-primary' : 'outline-secondary'} 
                                onClick={() => setSelectedVariant(index)}
                                className={'question-variant-btn' + (selectedVariant !== index ? ' hover-border':'')}
                            >
                                {index + 1}
                            </Button>
                        )}
                        {questionVariants.length < 10 && <Button
                            size='sm' 
                            variant='outline-secondary'
                            className='question-variant-btn hover-border on-card-hover'
                            onClick={() => pushNewVariant()}
                        >+</Button>}
                    </div>
                    <div>
                        <button className='icon-btn' title='Переместить ниже'><i className='fas fa-angle-down fa-lg'/></button>
                        <button className='icon-btn' title='Переместить выше'><i className='fas fa-angle-up fa-lg'/></button>
                        <button className='icon-btn' title='Удалить вопрос'><i className='fas fa-times fa-lg'/></button>
                    </div>
                </div>
                <div onClick={() => onQuestionEdit()}>
                    {questionVariants.map((variant, index) => 
                        <QuestionVariant key={index} show={selectedVariant == index} question={question} questionVariant={variant} isEditing={isEditing}/>
                    )}
                    
                </div>
            </div>
            {isEditing &&
                <div className='question-card-actions'>
                    <Button variant='outline-primary'>Добавить вопрос</Button>
                </div>
            }
        </div>
    )
}
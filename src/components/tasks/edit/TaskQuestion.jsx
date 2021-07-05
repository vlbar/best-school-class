import React, { useContext, useState } from 'react'
import { Button } from 'react-bootstrap'
import { sortableHandle } from 'react-sortable-hoc'
import { QuestionContext } from './QuestionsList'
import { QuestionVariant } from './QuestionVariant'
import './TaskQuestion.less'

const DragHandle = sortableHandle(() => <button className='icon-btn' title='Переместить'><i className='fas fa-grip-lines fa-lg'></i></button>)

export const TaskQuestion = ({index, question}) => {
    const { questionToChange, setQuestionToChange, addQuestionAfter, moveQuestion } = useContext(QuestionContext)
    const [isHover, setIsHover] = useState(false)
    const [selectedVariant, setSelectedVariant] = useState(0)
    const [questionVariants, setQuestionVariants] = useState([
        {
            id: undefined,
            formulation: '',
            position: 1,
            questionId: question.id,
            numberOfSymbols: '',
            type: 'TEXT_QUESTION'
        }
    ])

    let arrayIndex = index - 1

    const pushNewVariant = () => {
        let questionVariantsVar = questionVariants
        questionVariantsVar.push({
            id: undefined,
            formulation: '',
            position: questionVariantsVar.length,
            questionId: question.id,
            numberOfSymbols: '',
            type: 'TEXT_QUESTION'
        })

        setQuestionVariants([...questionVariantsVar])
    }


    const onQuestionEdit = () => {
        setQuestionToChange(index)
    }

    let isEditing = (questionToChange ? questionToChange === index : false)
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
                        <button className='icon-btn' title='Переместить ниже' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex + 1})}><i className='fas fa-angle-down fa-lg'/></button>
                        <button className='icon-btn' title='Переместить выше' onClick={() => moveQuestion({oldIndex: arrayIndex, newIndex: arrayIndex - 1})}><i className='fas fa-angle-up fa-lg'/></button>
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
                    <Button 
                        variant='outline-primary'
                        onClick={() => addQuestionAfter(question.position + 1)}
                    >
                        Добавить вопрос
                    </Button>
                </div>
            }
        </div>
    )
}
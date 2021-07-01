import React, { useState, useRef, useContext, useEffect } from 'react'
import { Row, Col, Button, Form, Dropdown } from 'react-bootstrap'
import { sortableContainer, sortableElement, sortableHandle, arrayMove } from 'react-sortable-hoc'
import './QuestionVariant.less'

//question types
const TEXT_QUESTION = 'TEXT_QEUSTION'
const TEST_QUESTION = 'TEST_QUESTION'
const TEST_MULTI_QUESTION = 'TEST_MULTI_QUESTION'

const questionTypeNames = {}
questionTypeNames[TEXT_QUESTION] = 'Текстовый ответ'
questionTypeNames[TEST_QUESTION] = 'Один из списка'
questionTypeNames[TEST_MULTI_QUESTION] = 'Несколько из списка'

const SOURCE_TEXT_QUESTION = 'TEXT_QUESTION'
const SOURCE_TEST_QUESTION = 'TEST_QUESTION'
const unambiguousQuestionTypeTranslate = {}
unambiguousQuestionTypeTranslate[SOURCE_TEXT_QUESTION] = TEXT_QUESTION

//sortable hoc
const AnswerDragHandle = sortableHandle(() => <button className='icon-btn mr-2' title='Переместить'><i className='fas fa-grip-lines fa-lg'></i></button>)
const SortableContainer = sortableContainer(({children}) => <div>{children}</div>)
const SortableItem = sortableElement(({index_, answerVariant}) => (
    <TestQuestionAnswerVariant index={index_} answerVariant={answerVariant} />
))

//Reducer
const AD_IS_RIGHT = 'IS_RIGHT'
const AD_ANSWER = 'ANSWER'
const AD_DELETE = 'DELETE'

//context
const QuestionContext = React.createContext();

export const QuestionVariant = ({show, question, questionVariant, isEditing}) => {
    const [formulation, setFormulation] = useState(questionVariant.formulation || '')
    const [questionType, setQuestionType] = useState(TEXT_QUESTION)
    const [questionParams, setQuestionParams] = useState({numberOfSymbols: 0})
    
    useEffect(() => {
        getQuestionParams()
    }, [])

    // -Anti select varinat focus. 
    // -Ford?
    const focus = useRef(false)
    useEffect(() => {
        focus.current = false
    }, [show])

    const getQuestionParams = () => {
        let sourseType = questionVariant.type
        let translatedType = unambiguousQuestionTypeTranslate[sourseType]
        if(!translatedType) 
            if(sourseType == SOURCE_TEST_QUESTION)
                if(questionVariant.isMultipleAnswer)
                    translatedType = TEST_MULTI_QUESTION
                else
                    translatedType = TEST_QUESTION                    
        setQuestionType(translatedType)

        switch(translatedType) {
            case TEST_QUESTION:
            case TEST_MULTI_QUESTION:
                setQuestionParams({testAnswerVariants: questionVariant.testAnswerVariants})
                break
            case TEXT_QUESTION:
                setQuestionParams({numberOfSymbols: questionVariant.numberOfSymbols})
        }
    }

    const onSelectType = (type) => {
        setQuestionType(type)

        if(type == TEST_MULTI_QUESTION || type == TEST_QUESTION) {
            if(type == TEST_QUESTION) uncheckMultiVarinats()

            setQuestionParams({ 
                isMultipleAnswer: type == TEST_MULTI_QUESTION, 
                testAnswerVariants: questionParams.testAnswerVariants !== undefined ? questionParams.testAnswerVariants : []
            })
        }
    }

    const uncheckMultiVarinats = () => {
        let testAnswerVariants = questionParams.testAnswerVariants
        if(testAnswerVariants !== undefined) {
            let flag = true
            testAnswerVariants.forEach(x => {
                if(x.isRight) {
                    x.isRight = flag
                    flag = false
                }
            })
        }
    }

    // и Redux этот ваш не нужон как бы
    const answerReducer = (index, action) => {
        let testAnswerVariants = questionParams.testAnswerVariants
        let targetVariant = testAnswerVariants[index]

        if(index == undefined) {
            targetVariant = addVarinat(testAnswerVariants.length, testAnswerVariants)
            focus.current = true
        } else {
            focus.current = false
        }

        switch(action.type) {
            case AD_IS_RIGHT:
                if(!questionParams.isMultipleAnswer) { 
                    testAnswerVariants.forEach(element => {
                        element.isRight = false
                    })
                    targetVariant.isRight = true
                }
                else {
                    targetVariant.isRight = action.payload
                }
                break
            case AD_ANSWER:
                targetVariant.answer = action.payload
                break
            case AD_DELETE:
                testAnswerVariants.splice(index, 1)
                break
        }

        setQuestionParams({
            isMultipleAnswer: questionParams.isMultipleAnswer,
            testAnswerVariants: testAnswerVariants
        })
    }

    const addVarinat = (index, testAnswerVariants) => {
        testAnswerVariants.push({
            answer: '',
            isRight: false
        })

        return testAnswerVariants[index]
    }

    const onSortEnd = ({oldIndex, newIndex}) => {
        let testAnswerVariants = questionParams.testAnswerVariants
        testAnswerVariants = arrayMove(testAnswerVariants, oldIndex, newIndex)
        setQuestionParams({
            isMultipleAnswer: questionParams.isMultipleAnswer,
            testAnswerVariants: testAnswerVariants
        })
    }

    const getQuestionInputs = (type) => {
        switch (type) {
            case TEXT_QUESTION:
                return (
                    <>
                        <Form.Group className='d-flex justify-content-start mb-0'>
                            <Form.Label className='label-center'>
                                Макс. длина ответа
                            </Form.Label>
                            <Form.Control 
                            type='number' 
                            min={1}
                            value={questionParams.numberOfSymbols} 
                            onChange={(e) => setQuestionParams({numberOfSymbols: e.target.value})} 
                            className='short-input hover-border'/>
                        </Form.Group>
                    </>
                )
            case TEST_QUESTION:
            case TEST_MULTI_QUESTION:
                return (
                    <div>
                        <QuestionContext.Provider value={{ question, questionParams, answerReducer, focus }}>
                            <SortableContainer onSortEnd={onSortEnd} useDragHandle>
                                {questionParams.testAnswerVariants.map((answer, index) => (
                                    <SortableItem key={index} index={index} index_={index} question={question} answerVariant={answer}/>
                                ))}
                                {isEditing && questionParams.testAnswerVariants.length < 10 && <TestQuestionAnswerVariant index={undefined} answerVariant={{answer: ''}} />}
                            </SortableContainer>
                        </QuestionContext.Provider>
                    </div>
                )
        }
    }

    if(show) return (
        <>
            <div className='question-formulation-block'>
                <Form.Control 
                    as='textarea' 
                    rows='2' 
                    wrap='soft' 
                    placeholder='Введите формулировку вопроса...' 
                    className='text-break' 
                    value={formulation} 
                    onChange={(e) => setFormulation(e.target.value)} 
                />
                <div className='variant-actions'>
                    <button className='icon-btn ml-2' title='Удалить данный вариант вопроса' onClick={() => answerReducer(index, {type: AD_DELETE})}>
                        <i className='fas fa-times fa-lg'/>
                    </button>
                    <button className='icon-btn ml-2 mt-2' title='Скопировать' onClick={() => answerReducer(index, {type: AD_DELETE})}>
                        <i className='far fa-copy fa-lg'/>
                    </button>
                </div>
            </div>
                    
            <Row>
                <Col className='mt-2'>
                    <div className='d-flex justify-content-start'>
                        <Dropdown onSelect={(e) => onSelectType(e)}>
                            <Dropdown.Toggle variant='outline-primary hover-border' size='sm'>
                                {questionTypeNames[questionType]}
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item eventKey={TEXT_QUESTION}>{questionTypeNames[TEXT_QUESTION]}</Dropdown.Item>
                                <Dropdown.Item eventKey={TEST_QUESTION}>{questionTypeNames[TEST_QUESTION]}</Dropdown.Item>
                                <Dropdown.Item eventKey={TEST_MULTI_QUESTION}>{questionTypeNames[TEST_MULTI_QUESTION]}</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </Col>

                <Col md={4} className='mt-2'>
                    <Form.Group className='flex-between float-right-screen mb-0' style ={{width: '155px'}}>
                        <Form.Label className='label-sm-center mr-3'>
                            Балл.
                        </Form.Label>
                        <Form.Control size='sm' type='number' className='hover-border' min={1} defaultValue={1}/>
                    </Form.Group>
                </Col>
            </Row>
        
            <div className='mt-2'>
                {getQuestionInputs(questionType)}
            </div>
        </>
    )
    else
        return <></>
}

const TestQuestionAnswerVariant = ({index, answerVariant}) => {
    const { question, questionParams, answerReducer, focus } = useContext(QuestionContext)

    let isAddVarinat = index == undefined
    return (
        <div className={`question-answer${isAddVarinat ? ' add-variant':''}`}>
            {!isAddVarinat &&
                <>
                    <AnswerDragHandle/>
                    <Form.Check
                        custom
                        checked={answerVariant.isRight}
                        onChange={(e) => answerReducer(index, {type: AD_IS_RIGHT, payload: e.target.checked})}
                        type={questionParams.isMultipleAnswer ? 'checkbox' : 'radio'}
                        id={`custom-inline-${question.id}-${index}`}
                        className='label-center mr-2'
                    />
                </>
            }
            <Form.Control
                autoFocus={!isAddVarinat && focus.current}
                type='text'
                className='hover-border'
                placeholder={isAddVarinat ? 'Добавить варинат ответа...' : 'Введите вариант ответа...'}
                value={answerVariant.answer}
                onChange={(e) => answerReducer(index, {type: AD_ANSWER, payload: e.target.value})}
            />
            {!isAddVarinat && <button className='icon-btn ml-2' title='Удалить' onClick={() => answerReducer(index, {type: AD_DELETE})}>
                <i className='fas fa-times fa-lg'/>
            </button>}
        </div>
    )
}
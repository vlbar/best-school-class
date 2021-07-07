import React, { useState, useRef, useContext, useEffect, useReducer } from 'react'
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

//flux
const FORMULATION = 'FORMULATION'
const QUESTION_TYPE = 'QUESTION_TYPE'

//text question
const NUMBER_OF_SYMBOLS = 'NUMBER_OF_SYMBOLS'
//test question
const IS_MULTIPLE_ANSWER = 'IS_MULTIPLE_ANSWER'
const ADD_ANSWER_VARIANT = 'ADD_ANSWER_VARIANT'
const IS_RIGHT = 'IS_RIGHT'
const ANSWER = 'ANSWER'
const MOVE_ANSWER = 'MOVE_ANSWER'
const DELETE_ANSWER = 'DELETE_ANSWER'

const variantReducer = (state, action) => {
    let answer
    let testAnswerVariants
    switch (action.type) {
        case FORMULATION:
            return { ...state, formulation: action.payload }
        case QUESTION_TYPE:
            return { ...state, type: action.payload }
        case NUMBER_OF_SYMBOLS:
            return { ...state, numberOfSymbols: action.payload }

        case IS_MULTIPLE_ANSWER:
            return { ...state, isMultipleAnswer: action.payload}
        case ADD_ANSWER_VARIANT:
            if(state.testAnswerVariants) 
            return { ...state, testAnswerVariants: [...state.testAnswerVariants, action.payload] }
            else return { ...state, testAnswerVariants: [action.payload] }
        case IS_RIGHT:
            testAnswerVariants = state.testAnswerVariants
            answer = testAnswerVariants[action.payload.answerIndex]

            if(!state.isMultipleAnswer) {
                testAnswerVariants.forEach(element => {
                    element.isRight = false
                })
                answer.isRight = true
            } else {
                answer.isRight = action.payload.isRight
            }
            return { ...state, testAnswerVariants: testAnswerVariants }
        case ANSWER:
            testAnswerVariants = state.testAnswerVariants
            answer = testAnswerVariants[action.payload.answerIndex]
            answer.answer = action.payload.answer
            return { ...state, testAnswerVariants: testAnswerVariants }
        case MOVE_ANSWER:
            testAnswerVariants = state.testAnswerVariants
            testAnswerVariants = arrayMove(testAnswerVariants, action.payload.oldIndex, action.payload.newIndex)
            return { ...state, testAnswerVariants: testAnswerVariants }
        case DELETE_ANSWER:
            testAnswerVariants = state.testAnswerVariants
            testAnswerVariants.splice(action.payload, 1)
            return { ...state, testAnswerVariants: testAnswerVariants }
        default:
            return state
    }
}

//context for question answer variants
const QuestionContext = React.createContext();

//requests
export const variantsPartUrl = 'variants'

export const QuestionVariant = ({show, question, questionVariant, isEditing}) => {
    const [questionType, setQuestionType] = useState(TEXT_QUESTION)
    const [variant, dispatchVariant] = useReducer(variantReducer, questionVariant)
    const lastSavedData = useRef({})

    const setFormulation = (formulation) => dispatchVariant({ type: FORMULATION, payload: formulation })
    const setVariantType = (questionType) => dispatchVariant({ type: QUESTION_TYPE, payload: questionType })
    const setNumberOfSymbols = (numberOfSymbols) => dispatchVariant({type: NUMBER_OF_SYMBOLS, payload: numberOfSymbols})
    const setIsMultipleAnswer = (isMultipleAnswer) => dispatchVariant({type: IS_MULTIPLE_ANSWER, payload: isMultipleAnswer})
    const addAnswerVariant = (answerVariant) => dispatchVariant({ type: ADD_ANSWER_VARIANT, payload: answerVariant })
    const setIsRightAnswer = (answerIndex, isRight) => dispatchVariant({type: IS_RIGHT, payload: { answerIndex, isRight}})
    const setAnswerText = (answerIndex, answer) => dispatchVariant({type: ANSWER, payload: { answerIndex, answer}})
    const moveAnswerVariant = ({oldIndex, newIndex}) => dispatchVariant({type: MOVE_ANSWER, payload: { oldIndex, newIndex }})
    const deleteAnswer = (answerIndex) => dispatchVariant({type: DELETE_ANSWER, payload: answerIndex})

    useEffect(() => {
        getQuestionParams()
        lastSavedData.current = questionVariant
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
    }

    const onSelectType = (type) => {
        setQuestionType(type)

        if(type == TEST_QUESTION) uncheckMultiVarinats()
        if(type == TEST_MULTI_QUESTION || type == TEST_QUESTION) {
            setIsMultipleAnswer(type == TEST_MULTI_QUESTION)
        }
    }

    const uncheckMultiVarinats = () => {
        let testAnswerVariants = variant.testAnswerVariants
        if(testAnswerVariants !== undefined) {
            let flag = true
            for(let i = 0; i < testAnswerVariants.length; i++) {
                if(testAnswerVariants[i].isRight) {
                    setIsRightAnswer(i, flag)
                    flag = false
                }
            }
        }
    }

    const addVarinat = (answer) => {
        focus.current = true
        addAnswerVariant({
            answer: answer,
            isRight: false
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
                            value={variant.numberOfSymbols} 
                            onChange={(e) => setNumberOfSymbols(Number(e.target.value))} 
                            className='short-input hover-border'/>
                        </Form.Group>
                    </>
                )
            case TEST_QUESTION:
            case TEST_MULTI_QUESTION:
                return (
                    <div>
                        <QuestionContext.Provider value={{ question, variant, setIsRightAnswer, setAnswerText, deleteAnswer, focus }}>
                            <SortableContainer onSortEnd={moveAnswerVariant} useDragHandle>
                                {(variant.testAnswerVariants) && variant.testAnswerVariants.map((answer, index) => (
                                    <SortableItem key={index} index={index} index_={index} question={question} answerVariant={answer}/>
                                ))}

                                {(isEditing && (!variant.testAnswerVariants || variant.testAnswerVariants.length < 10)) &&
                                    <div className='add-question-variant'>
                                        <Form.Control
                                            type='text'
                                            className='hover-border'
                                            placeholder={'Добавить варинат ответа...'}
                                            value={''}
                                            onChange={(e) => addVarinat(e.target.value)}
                                        />
                                    </div>
                                }
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
                    value={variant.formulation} 
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
    const { question, variant, setIsRightAnswer, setAnswerText, deleteAnswer, focus } = useContext(QuestionContext)

    return (
        <div className='question-answer'>
            <AnswerDragHandle/>
            <Form.Check
                custom
                checked={answerVariant.isRight}
                onChange={(e) => setIsRightAnswer(index, e.target.checked)}
                type={variant.isMultipleAnswer ? 'checkbox' : 'radio'}
                id={`custom-inline-${question.id}-${index}`}
                className='label-center mr-2'
            />
            <Form.Control
                autoFocus={focus.current}
                type='text'
                className='hover-border'
                placeholder='Введите вариант ответа...'
                value={answerVariant.answer}
                onChange={(e) => setAnswerText(index, e.target.value)}
            />
            <button className='icon-btn ml-2' title='Удалить' onClick={() => deleteAnswer(index)}>
                <i className='fas fa-times fa-lg'/>
            </button>
        </div>
    )
}
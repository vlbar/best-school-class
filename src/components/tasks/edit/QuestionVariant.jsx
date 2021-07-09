import React, { useState, useRef, useContext, useEffect, useReducer } from 'react'
import { Row, Col, Button, Form, Dropdown } from 'react-bootstrap'
import { addErrorNotification } from '../../notifications/notifications'
import { sortableContainer, sortableElement, sortableHandle, arrayMove } from 'react-sortable-hoc'
import { useTaskSaveManager, isEquivalent, SAVED_STATUS, ERROR_STATUS, VALIDATE_ERROR_STATUS } from './TaskSaveManager'
import { questionPartUrl } from './QuestionsList'
import { TaskQuestionContext } from './TaskQuestion'
import axios from 'axios'
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

const toSourceQuestionTypeTranslator = {}
toSourceQuestionTypeTranslator[TEXT_QUESTION] = SOURCE_TEXT_QUESTION
toSourceQuestionTypeTranslator[TEST_QUESTION] = SOURCE_TEST_QUESTION
toSourceQuestionTypeTranslator[TEST_MULTI_QUESTION] = SOURCE_TEST_QUESTION

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
const QuestionAnswerContext = React.createContext();

//requests
export const variantsPartUrl = 'variants'

async function addVariant(variant, questionId) {
    return axios.post(`${questionPartUrl}/${questionId}/${variantsPartUrl}`, variant)
}

async function updateVariant(variant, questionId) {
    return axios.put(`${questionPartUrl}/${questionId}/${variantsPartUrl}/${variant.id}`, variant)
}

async function deleteVariant(variant, questionId) {
    return axios.delete(`${questionPartUrl}/${questionId}/${variantsPartUrl}/${variant.id}`)
}

export const QuestionVariant = ({show, index, questionVariant, isEditing}) => {
    const [questionType, setQuestionType] = useState(TEXT_QUESTION)
    const [variant, dispatchVariant] = useReducer(variantReducer, questionVariant)
    const statusBySub = useTaskSaveManager(saveVariant)
    const lastSavedData = useRef({})

    const { question, variantCount, markForDeleteVariant, deleteQuestionVariant } = useContext(TaskQuestionContext)
    const isDeleted = useRef(false)

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
        setLastSavedData(questionVariant)
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
        setVariantType(toSourceQuestionTypeTranslator[type])

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

    const addAnswerVarinat = (answer) => {
        focus.current = true
        addAnswerVariant({
            answer: answer,
            isRight: false
        })
    }

    function saveVariant() {
        if(!isDeleted.current && isEquivalent(variant, lastSavedData.current)) { 
            statusBySub(SAVED_STATUS)
            return
        }

        if(!variant.id) {
            if(variant.type == SOURCE_TEST_QUESTION) {
                setIsMultipleAnswer(questionType == TEST_MULTI_QUESTION)
            }

            addVariant(variant, question.id)
                .then(res => { 
                    statusBySub(SAVED_STATUS)
                    setLastSavedData(variant)
                })
                .catch(error => {
                    statusBySub(ERROR_STATUS)
                    addErrorNotification('Не удалось сохранить информацию о задании. \n' + (error?.response?.data?.message ? error.response.data.message : error))
                })
        } else {
            if(!isDeleted.current)
                updateVariant(variant, question.id)
                    .then(res => { 
                        statusBySub(SAVED_STATUS)
                        setLastSavedData(variant)
                    })
                    .catch(error => {
                        statusBySub(ERROR_STATUS)
                        addErrorNotification('Не удалось сохранить информацию о задании. \n' + (error?.response?.data?.message ? error.response.data.message : error))
                    })
            else
                deleteVariant(variant, question.id)
                    .then(res => { 
                        statusBySub(SAVED_STATUS)
                        deleteQuestionVariant(index)
                    })
                    .catch(error => {
                        statusBySub(ERROR_STATUS)
                        addErrorNotification('Не удалось сохранить информацию о задании. \n' + (error?.response?.data?.message ? error.response.data.message : error))
                    })
        }
    }

    const setLastSavedData = (questionVariant) => {
        if(questionVariant.type == SOURCE_TEST_QUESTION) {
            lastSavedData.current = cloneTestAnswers(questionVariant)
        } else {
            lastSavedData.current = questionVariant
        }
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
                        <QuestionAnswerContext.Provider value={{ question, variant, setIsRightAnswer, setAnswerText, deleteAnswer, focus }}>
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
                                            onChange={(e) => addAnswerVarinat(e.target.value)}
                                        />
                                    </div>
                                }
                            </SortableContainer>
                        </QuestionAnswerContext.Provider>
                    </div>
                )
        }
    }

    const markVariantForDelete = () => {
        isDeleted.current = true
        markForDeleteVariant(index)
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
                    <Dropdown className='options-dropdown'>
                        <Dropdown.Toggle size='sm' variant='best' id='dropdown-basic'>⋮</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item disabled={true}>Вставить</Dropdown.Item>
                            <Dropdown.Item>Скопировать</Dropdown.Item>
                            <Dropdown.Item className='text-danger' disabled={variantCount == 1} onClick={() => markVariantForDelete()}>Удалить вариант</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
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
    const { question, variant, setIsRightAnswer, setAnswerText, deleteAnswer, focus } = useContext(QuestionAnswerContext)

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
                <i className='fas fa-times fa-sm'/>
            </button>
        </div>
    )
}

const cloneTestAnswers = (questionVariant) => {
    // ДА ОТВЯЖЫЗЬ ЖЕ ТЫ ОТ НЕВО !!1!!11
    let colnedTestAnswerVariants = []
    questionVariant.testAnswerVariants.forEach(answerVar => {
        colnedTestAnswerVariants.push({...answerVar})
    })
    return {...questionVariant, testAnswerVariants: colnedTestAnswerVariants}
}
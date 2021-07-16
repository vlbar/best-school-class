import React, { useState, useRef, useContext, useEffect, useReducer } from 'react'
import { Row, Col, Button, Form, Dropdown } from 'react-bootstrap'
import { addErrorNotification } from '../../notifications/notifications'
import { sortableContainer, sortableElement, sortableHandle, arrayMove } from 'react-sortable-hoc'
import { useTaskSaveManager, isEquivalent, SAVED_STATUS, ERROR_STATUS, VALIDATE_ERROR_STATUS } from './TaskSaveManager'
import { questionPartUrl } from './QuestionsList'
import { TaskQuestionContext } from './TaskQuestion'
import useBestValidation from './useBestValidation'
import axios from 'axios'
import './QuestionVariant.less'
import FeedbackMessage from '../../feedback/FeedbackMessage'

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
const SET = 'SET'
const FORMULATION = 'FORMULATION'
const QUESTION_TYPE = 'QUESTION_TYPE'

//text question
const NUMBER_OF_SYMBOLS = 'NUMBER_OF_SYMBOLS'
//test question
const IS_MULTIPLE_ANSWER = 'IS_MULTIPLE_ANSWER'
const ADD_ANSWER_VARIANT = 'ADD_ANSWER_VARIANT'
const RESET_ANSWER_VARIANTS = 'RESET_ANSWER_VARIANTS'
const DELETE_ANSWER_VARIANTS = 'DELETE_ANSWER_VARIANTS'
const IS_RIGHT = 'IS_RIGHT'
const ANSWER = 'ANSWER'
const MOVE_ANSWER = 'MOVE_ANSWER'
const DELETE_ANSWER = 'DELETE_ANSWER'

const variantReducer = (state, action) => {
    let answer
    let testAnswerVariants
    switch (action.type) {
        case SET:
            state = action.payload
            return { ...state }
        case FORMULATION:
            return { ...state, formulation: action.payload }
        case QUESTION_TYPE:
            return { ...state, type: action.payload }
        case NUMBER_OF_SYMBOLS:
            if(action.payload === undefined) {
                delete state.numberOfSymbols
                return { ...state }
            }
            return { ...state, numberOfSymbols: action.payload }

        case IS_MULTIPLE_ANSWER:
            if(action.payload === undefined) {
                delete state.isMultipleAnswer
                return { ...state }
            }
            return { ...state, isMultipleAnswer: action.payload}
        case ADD_ANSWER_VARIANT:
            if(state.testAnswerVariants) 
            return { ...state, testAnswerVariants: [...state.testAnswerVariants, action.payload] }
            else return { ...state, testAnswerVariants: [action.payload] }
        case RESET_ANSWER_VARIANTS:
            return { ...state, testAnswerVariants: []}
        case DELETE_ANSWER_VARIANTS:
            delete state.testAnswerVariants
            return { ...state }
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

//validation
const variantValidationSchema = {
    formulation: {
        type: 'string',
        required: ['Не введена формулировка вопроса'],
        min: [5, 'Слишком короткая формулировка вопроса'],
        max: [1024, 'Слишком длинная формулировка вопроса']
    },

    // text variant
    numberOfSymbols: {
        type: 'number',
        min: [1, 'Длина ответа должна быть больше 0'],
        max: [9223372036854775807, 'Слишком большая длина ответа']
    },

    //test variant
    testAnswerVariants: {
        type: 'array', of: {
            answer: {
                type: 'string',
                required: ['Не введен вариант ответа'],
                max: [1024, 'Слишком длинный вариант ответа']
            }
        },
        required: ['Не введены ответы на вопрос'],
        min: [2, 'Необходимо добавить минимум 2 ответа']
    }
}

const answerVariantsValidarionSсhema = {
    noIsRight: 'Не отмечен правильный вариант ответа'
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
    const { statusBySub, setIsChanged } = useTaskSaveManager(saveVariant)
    const lastSavedData = useRef({...questionVariant})
    const awaitQuestionSave = useRef(false)

    const { question, setQuestionVariant, pasteVariantAfter, variantCount, markForDeleteVariant, deleteQuestionVariant } = useContext(TaskQuestionContext)
    const isDeleted = useRef(false)

    const setVariant = (variant) => dispatchVariant({ type: SET, payload: variant })
    const setFormulation = (formulation) => dispatchVariant({ type: FORMULATION, payload: formulation })
    const setVariantType = (questionType) => dispatchVariant({ type: QUESTION_TYPE, payload: questionType })

    // text variant
    const setNumberOfSymbols = (numberOfSymbols) => dispatchVariant({type: NUMBER_OF_SYMBOLS, payload: numberOfSymbols})

    //test variant
    const setIsMultipleAnswer = (isMultipleAnswer) => dispatchVariant({type: IS_MULTIPLE_ANSWER, payload: isMultipleAnswer})
    const addAnswerVariant = (answerVariant) => dispatchVariant({ type: ADD_ANSWER_VARIANT, payload: answerVariant })
    const resetAnswerVariants = () => dispatchVariant({ type : RESET_ANSWER_VARIANTS })
    const deleteAnswerVariants = () => dispatchVariant({ type : DELETE_ANSWER_VARIANTS })
    const setIsRightAnswer = (answerIndex, isRight) => dispatchVariant({type: IS_RIGHT, payload: { answerIndex, isRight}})
    const setAnswerText = (answerIndex, answer) => dispatchVariant({type: ANSWER, payload: { answerIndex, answer}})
    const moveAnswerVariant = ({oldIndex, newIndex}) => dispatchVariant({type: MOVE_ANSWER, payload: { oldIndex, newIndex }})
    const deleteAnswer = (answerIndex) => dispatchVariant({type: DELETE_ANSWER, payload: answerIndex})

    const variantValidation = useBestValidation(variantValidationSchema)
    const answerVariantsValdiation = useAnswerVariantsValidationHook(answerVariantsValidarionSсhema)

    useEffect(() => {
        let targetVariant = variant
        targetVariant.isValid = variantValidation.isValid
        setQuestionVariant(targetVariant, index)
    }, [variantValidation.isValid])

    useEffect(() => {
        getQuestionParams()
        setLastSavedData(questionVariant)
    }, [])

    useEffect(() => {
        setQuestionVariant(variant, index)
        setIsChanged(!isEquivalent(variant, lastSavedData.current))
    }, [variant])

    useEffect(() => {
        if(!question.detached && awaitQuestionSave.current) {
            awaitQuestionSave.current = false
            saveVariant()
        }
    }, [question.id])

    // -Anti select varinat focus. 
    // -Ford?
    const focus = useRef(false)
    useEffect(() => {
        focus.current = false
    }, [show])

    const getQuestionParams = (targetVartiant = questionVariant) => {
        let sourseType = targetVartiant.type
        let translatedType = unambiguousQuestionTypeTranslate[sourseType]
        if(!translatedType) 
            if(sourseType == SOURCE_TEST_QUESTION)
                if(targetVartiant.isMultipleAnswer)
                    translatedType = TEST_MULTI_QUESTION
                else
                    translatedType = TEST_QUESTION                    
        setQuestionType(translatedType)
    }

    const onSelectType = (type) => {
        let latestType = questionType
        setQuestionType(type)
        setVariantType(toSourceQuestionTypeTranslator[type])

        if(!(type == TEST_MULTI_QUESTION || type == TEST_QUESTION)) {
            setIsMultipleAnswer(undefined)
            deleteAnswerVariants()
        }

        if(type !== TEXT_QUESTION) { 
            setNumberOfSymbols(undefined)
        }

        if(type == TEST_QUESTION) uncheckMultiVarinats()
        if(type == TEST_MULTI_QUESTION || type == TEST_QUESTION) {
            if(!(latestType === TEST_MULTI_QUESTION || latestType === TEST_QUESTION)) resetAnswerVariants()
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

        let fakeVariants = new Array(variant.testAnswerVariants.length + 1).fill({})
        variantValidation.blurHandle({target: {name: 'testAnswerVariants', value: fakeVariants}})
    }

    const deleteAnswerVariant = (answerIndex) => {
        deleteAnswer(answerIndex)
        let fakeVariants = new Array(variant.testAnswerVariants.length - 1).fill({})
        variantValidation.blurHandle({target: {name: 'testAnswerVariants', value: fakeVariants}})
    }

    const setIsRightAnswerVariant = (answerIndex, isRight) => {
        setIsRightAnswer(answerIndex, isRight)
        let testAnswerVariants = variant.testAnswerVariants
        testAnswerVariants[answerIndex].isRight = isRight
        answerVariantsValdiation.changeHandle(NO_IS_RIGHT_VALIDATION, testAnswerVariants)
    }

    async function saveVariant() {
        if(!variantValidation.validate(variant) | (variant.type === SOURCE_TEST_QUESTION && !answerVariantsValdiation.validate([...variant.testAnswerVariants]))) {
            statusBySub(VALIDATE_ERROR_STATUS)
            return
        }

        if(question?.detached) {
            awaitQuestionSave.current = true
            return
        }

        if(!isDeleted.current && isEquivalent(variant, lastSavedData.current)) { 
            statusBySub(SAVED_STATUS)
            return
        }

        if(!variant.id) {
            if(variant.type == SOURCE_TEST_QUESTION) {
                setIsMultipleAnswer(questionType == TEST_MULTI_QUESTION)
            }

            addVariant(variant, question.id)
                .then(res => successfulSaved())
                .catch(error => catchSaveError(error))
        } else {
            if(!isDeleted.current)
                if(lastSavedData.current.type !== variant.type) {
                    deleteVariant(variant, question.id)
                    .then(res => {
                        addVariant(variant, question.id)
                        .then(res => { 
                            statusBySub(SAVED_STATUS)
                            setLastSavedData(variant)
                        })
                        .catch(error => catchSaveError(error))
                    })
                    .catch(error => catchSaveError(error))
                } else {
                    updateVariant(variant, question.id)
                    .then(res => successfulSaved())
                    .catch(error => catchSaveError(error))
                }
            else
                deleteVariant(variant, question.id)
                    .then(res => { 
                        statusBySub(SAVED_STATUS)
                        deleteQuestionVariant(index)
                    })
                    .catch(error => catchSaveError(error))
        }
    }

    const successfulSaved = () => {
        statusBySub(SAVED_STATUS)
        setLastSavedData(variant)
    }

    const catchSaveError = (error) => {
        statusBySub(ERROR_STATUS)
        addErrorNotification('Не удалось сохранить информацию о задании. \n' + (error?.response?.data?.message ? error.response.data.message : error))
    }

    const setLastSavedData = (questionVariant) => {
        if(questionVariant.type == SOURCE_TEST_QUESTION) {
            lastSavedData.current = cloneTestAnswers(questionVariant)
        } else {
            lastSavedData.current = questionVariant
        }
    }

    const saveVariantToStorage = () => {
        localStorage.copiedVariant = JSON.stringify(variant)
    }

    const pasteVariantFromStorage = () => {
        let copiedVariant = JSON.parse(localStorage.copiedVariant)
        pasteVariantAfter(copiedVariant, index)
        
        copiedVariant.id = variant.id
        setVariant(copiedVariant)
        getQuestionParams(copiedVariant)
    }

    const getQuestionInputs = (type) => {
        switch (type) {
            case TEXT_QUESTION:
                return (
                    <>
                        <Form.Group className='d-flex justify-content-start mb-0'>
                            <Form.Label className='label-center mb-0'>
                                Макс. длина ответа
                            </Form.Label>
                            <Form.Control 
                                type='number'
                                min={1}
                                className='short-input hover-border'
                                value={variant.numberOfSymbols}
                                name='numberOfSymbols'
                                isInvalid={variantValidation.errors.numberOfSymbols}
                                onBlur={variantValidation.blurHandle}
                                onChange={(e) => { 
                                    setNumberOfSymbols(Number(e.target.value))
                                    variantValidation.changeHandle(e)
                                }}
                            />
                            
                            <Form.Control.Feedback type="invalid" className='pt-1 w-25 ml-2'>
                                {variantValidation.errors.numberOfSymbols}
                            </Form.Control.Feedback>
                        </Form.Group>
                    </>
                )
            case TEST_QUESTION:
            case TEST_MULTI_QUESTION:
                return (
                    <div>
                        <QuestionAnswerContext.Provider value={{ question, variant, setIsRightAnswerVariant, setAnswerText, deleteAnswerVariant, focus, variantValidation }}>
                            <SortableContainer onSortEnd={moveAnswerVariant} useDragHandle>
                                {(variant.testAnswerVariants) && variant.testAnswerVariants.map((answer, index) => (
                                    <SortableItem key={index} index={index} index_={index} question={question} answerVariant={answer}/>
                                ))}

                                {(isEditing && (!variant.testAnswerVariants || variant.testAnswerVariants.length < 10)) &&
                                    <div className='add-question-variant mt-2'>
                                        <Form.Control
                                            type='text'
                                            className='hover-border'
                                            placeholder={'Добавить варинат ответа...'}
                                            value={''}
                                            onChange={(e) => addAnswerVarinat(e.target.value)}
                                        />
                                    </div>
                                }

                                <FeedbackMessage message={[variantValidation.errors.testAnswerVariants, answerVariantsValdiation.errors.noIsRight]}/>
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
                    name='formulation'
                    onBlur={variantValidation.blurHandle}
                    isInvalid={variantValidation.errors.formulation}
                    value={variant.formulation} 
                    onChange={(e) => {
                        setFormulation(e.target.value)
                        variantValidation.changeHandle(e)
                    }} 
                />
                <div className='variant-actions'>
                    <Dropdown className='options-dropdown'>
                        <Dropdown.Toggle size='sm' variant='best' id='dropdown-basic'>⋮</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item disabled={localStorage.copiedVariant == undefined} onClick={() => pasteVariantFromStorage()}>Вставить</Dropdown.Item>
                            <Dropdown.Item onClick={() => saveVariantToStorage()}>Скопировать</Dropdown.Item>
                            <Dropdown.Item className='text-danger' disabled={variantCount == 1} onClick={() => markVariantForDelete()}>Удалить вариант</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <FeedbackMessage message={variantValidation.errors.formulation}/>
                    
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
            </Row>
        
            <div>
                {getQuestionInputs(questionType)}
            </div>
        </>
    )
    else
        return <></>
}

const TestQuestionAnswerVariant = ({index, answerVariant}) => {
    const { question, variant, setIsRightAnswerVariant, setAnswerText, deleteAnswerVariant, focus, variantValidation } = useContext(QuestionAnswerContext)

    let fieldName = `testAnswerVariants[${index}].answer`
    return (<>
        <div className='question-answer'>
            <AnswerDragHandle/>
            <Form.Check
                custom
                checked={answerVariant.isRight}
                onChange={(e) => setIsRightAnswerVariant(index, e.target.checked)}
                type={variant.isMultipleAnswer ? 'checkbox' : 'radio'}
                id={`custom-inline-${question.id}-${index}`}
                className='label-center mr-2'
            />
            <Form.Control
                autoFocus={focus.current}
                type='text'
                name={fieldName}
                className='hover-border'
                placeholder='Введите вариант ответа...'
                value={answerVariant.answer}
                onBlur={variantValidation.blurHandle}
                isInvalid={variantValidation.errors[fieldName]}
                onChange={(e) => {
                    setAnswerText(index, e.target.value)
                    variantValidation.changeHandle(e)
                }}
            />
            <button className='icon-btn ml-2' title='Удалить' onClick={() => deleteAnswerVariant(index)}>
                <i className='fas fa-times fa-sm'/>
            </button>
        </div>
        <FeedbackMessage message={variantValidation.errors[fieldName]} className='varinat-answer-feedback'/>
    </>)
}

const cloneTestAnswers = (questionVariant) => {
    // ДА ОТВЯЖЫЗЬ ЖЕ ТЫ ОТ НЕВО !!1!!11
    let colnedTestAnswerVariants = []
    questionVariant.testAnswerVariants.forEach(answerVar => {
        colnedTestAnswerVariants.push({...answerVar})
    })
    return {...questionVariant, testAnswerVariants: colnedTestAnswerVariants}
}

/*
    {
        noIsRight: ''
    }
*/

const NO_IS_RIGHT_VALIDATION = 'noIsRight'

function useAnswerVariantsValidationHook(validationSchema) {
    const [errors, setErrors] = useState({})

    function changeHandle(fieldName, variants) {
        let targetErrors = errors
        delete targetErrors[fieldName]
        setErrors(targetErrors)

        switch(fieldName) {
            case NO_IS_RIGHT_VALIDATION:
                let hasCheked = false
                variants.forEach(variant => {
                    if(variant.isRight) {
                        hasCheked = true
                    }
                })

                if(!hasCheked)
                    addError(NO_IS_RIGHT_VALIDATION, validationSchema[NO_IS_RIGHT_VALIDATION])
                break
        }
    }

    function addError(fieldName, error) {
        let targetErrors = errors
        targetErrors[fieldName] = error
        setErrors(targetErrors)
    }

    function validate(variants) {
        setErrors({})

        let targetFields = Object.getOwnPropertyNames(validationSchema)
        targetFields.forEach(x => {
            changeHandle(x, variants)
        })

        return isEmpty(errors)
    }

    return {
        changeHandle,
        validate,
        errors
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
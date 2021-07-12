import { useState, useCallback, useEffect } from 'react'

/*
    fieldName: [
        type:      string or number or array,    (default is string)
        of:        {}                            (only for array type)
        required:  [Message] or [false],
        trim:      true,                         (default is true)
        min:       [minValue, Message],
        max:       [maxValue, Message],
    ]
*/

const STRING_TYPE = 'STRING'
const NUMBER_TYPE = 'NUMBER'
const ARRAY_TYPE = 'ARRAY'

export default function useBestValidation(validationSchema) {
    const [isValid, setIsValid] = useState(true)
    const [isTouched, setIsTouched] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if(validationSchema === undefined) {
            console.error('Best Validation Schema (Best Scheme Checker) in required')
        }
    }, [])

    function blurHandle(e) {
        if(e.target.name.length === 0) {
            console.error('Input name is required for validation!')
            return
        }

        setIsTouched(true)
        validateField(e.target.name, e.target.value, pathToSchema(e.target.name, validationSchema))
    }

    function changeHandle(e) {
        if(e.target.name.length === 0) {
            console.error('Input name is required for validation!')
            return
        }

        if(isTouched)
            validateField(e.target.name, e.target.value, pathToSchema(e.target.name, validationSchema))
    }

    function validate(obj) {
        if(obj === undefined) {
            console.error('Object to validate is undefined')
            return
        }

        setErrors({})
        setIsTouched(true)
        let validationSchemaFields = Object.getOwnPropertyNames(validationSchema)
        let validateFields = Object.getOwnPropertyNames(obj)
        validateFields.forEach(x => {
            if(validationSchemaFields.includes(x)) {
                validateField(x, obj[x], validationSchema)
            }
        })

        setIsValid(isEmpty(errors))
        return isEmpty(errors)
    }

    const validateField = useCallback(function(fieldPath, value, validationSchema) {
        let fieldName = getFieldName(fieldPath)
        if (validationSchema[fieldName] === undefined) {
            return
        }

        resetError(fieldPath)

        switch(validationSchema[fieldName].type.toUpperCase()) {
            case STRING_TYPE: 
                validateString(value, fieldPath, validationSchema)
                break
            case NUMBER_TYPE: 
                validateNumber(value, fieldPath, validationSchema)
                break
            case ARRAY_TYPE:
                validateArray([...value], fieldPath, validationSchema)
                forEachValidateField([...value], validationSchema[fieldName].of)
                break
        }
    }, [])

    function forEachValidateField(array, validationSchema) {
        let validationSchemaFields = Object.getOwnPropertyNames(validationSchema)
        array.forEach((item, index) => {
            let validateFields = Object.getOwnPropertyNames(item)
            validateFields.forEach(x => {
                if(validationSchemaFields.includes(x)) {
                    validateField(`testAnswerVariants[${index}].${x}`, item[x], validationSchema)
                }
            })
        })
    }

    //   TYPES
    function validateString(value, fieldPath, validationSchema) {
        let fieldName = getFieldName(fieldPath)
        let fieldSchema = validationSchema[fieldName]
        
        if(!fieldSchema.trim || fieldSchema.trim !== false) value = value.trim()
        if(!requiredCheck(fieldPath, value, fieldSchema)) return
        if(!valueCheck(fieldPath, (x) => x > value.length, fieldSchema, 'min')) return
        if(!valueCheck(fieldPath, (x) => x < value.length, fieldSchema, 'max')) return
    }

    function validateNumber(value, fieldPath, validationSchema) {
        let fieldName = getFieldName(fieldPath)
        let fieldSchema = validationSchema[fieldName]

        if(!requiredCheck(fieldPath, value, fieldSchema)) return
        if(!valueCheck(fieldPath, (x) => x > value, fieldSchema, 'min')) return
        if(!valueCheck(fieldPath, (x) => x < value, fieldSchema, 'max')) return
    }

    function validateArray(value, fieldPath, validationSchema) {
        let fieldName = getFieldName(fieldPath)
        let fieldSchema = validationSchema[fieldName]

        if(!requiredCheck(fieldPath, value, fieldSchema)) return
        if(!valueCheck(fieldPath, (x) => x > value.length, fieldSchema, 'min')) return
        if(!valueCheck(fieldPath, (x) => x < value.length, fieldSchema, 'max')) return
    }


    function requiredCheck(fieldPath, value, fieldSchema) {
        if(fieldSchema.required && fieldSchema.required[0] !== false && (value === undefined || value.length === 0)) {
            addError(fieldPath, fieldSchema.required[0])
            return false
        }
        return true
    }

    function valueCheck(fieldPath, strategy, fieldSchema, inSchemaFieldName) {
        if(fieldSchema[inSchemaFieldName] && fieldSchema[inSchemaFieldName][0] !== undefined) {
            if(strategy(fieldSchema[inSchemaFieldName][0])) {
                addError(fieldPath, fieldSchema[inSchemaFieldName][1])
                return false
            }
        }
        return true
    }

    // UTIL
    function addError(fieldPath, error) {
        let targetErrors = errors
        targetErrors[fieldPath] = error
        setErrors(targetErrors)
    }

    function resetError(fieldPath) {
        let targetErrors = errors
        delete targetErrors[fieldPath]
        setErrors(targetErrors)
    }

    return {
        changeHandle,
        blurHandle,
        validate,
        isValid,
        errors
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function getFieldName(path) {
    let lastPointIndex = path.lastIndexOf('.') + 1
    if(lastPointIndex > 0)
        return path.substring(lastPointIndex)
    else return path
}

function pathToSchema(path, schema) {
    let newSchema = schema
    let chagedPath = path
    while(chagedPath.indexOf('[') > 0) {
        let firstIndex = chagedPath.indexOf('[')
        if(firstIndex > 0) {
            let firstCloseIndex = chagedPath.indexOf(']')
            if(firstCloseIndex > 0) {
                let name = chagedPath.substring(0, firstIndex)
                newSchema = newSchema[name].of
                chagedPath = chagedPath.substring(firstCloseIndex + 2)
            }
        }
    }

    return newSchema
}
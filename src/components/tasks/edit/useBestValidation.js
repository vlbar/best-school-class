import { useState, useCallback, useEffect } from 'react'

/*
    fieldName: [
        type:      string/number/array/object,    (default is string)
        of:        {}                             (only for array type (of object is coming 😜 uwu))
        required:  [Message] or [false],
        nullable:  boolean
        trim:      boolean,                       (default is true)
        min:       [minValue, Message],
        max:       [maxValue, Message],
    ]

    TODO:
    1. rework validation of nested fields when validate one
    2. add async validate
*/

export const STRING_TYPE = 'STRING'
export const NUMBER_TYPE = 'NUMBER'
export const ARRAY_TYPE = 'ARRAY'
export const OBJECT_TYPE = 'OBJECT'

export default function useBestValidation(validationSchema) {
    const [isValid, setIsValid] = useState(true)
    const [isTouched, setIsTouched] = useState(false)
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if(validationSchema === undefined) {
            console.error('Best Validation Schema (Best Scheme Checker) in required')
        }
    }, [])

    // EVENTS
    function blurHandle(e) {
        if(e.target.name.length === 0) {
            console.error('Input name is required for validation!')
            return
        }

        let error = validateField(e.target.name, e.target.value, pathToSchema(e.target.name, validationSchema))

        let currentErrors = errors
        if(error) currentErrors[e.target.name] = error
        else delete currentErrors[e.target.name]

        setIsTouched(true)
        setErrors(currentErrors)
        setIsValid(isEmpty(currentErrors))
    }

    function changeHandle(e) {
        if(e.target.name.length === 0) {
            console.error('Input name is required for validation!')
            return
        }

        if(isTouched) {
            let error = validateField(e.target.name, e.target.value, pathToSchema(e.target.name, validationSchema))

            let currentErrors = errors
            if(error) currentErrors[e.target.name] = error
            else delete currentErrors[e.target.name]
            
            setErrors(currentErrors)
            setIsValid(isEmpty(currentErrors))
        }
    }

    // FUNCTIONS
    function validate(obj) {
        if(obj === undefined) {
            console.error('Object to validate is undefined')
            return
        }

        let currentErrors = {}
        const addErrorIfExists = (name, error) => {
            if(error) currentErrors[name] = error
        }

        let validationSchemaFields = Object.getOwnPropertyNames(validationSchema)
        let validateFields = Object.getOwnPropertyNames(obj)
        validateFields.forEach(x => {
            if(validationSchemaFields.includes(x)) {
                addErrorIfExists(x, validateField(x, obj[x], validationSchema, addErrorIfExists))
            }
        })

        setIsTouched(true)
        setErrors(currentErrors)
        setIsValid(isEmpty(currentErrors))
        return isEmpty(currentErrors)
    }


    const validateField = (fieldPath, value, validationSchema, addErrorCallback) => {
        let fieldName = getFieldName(fieldPath)
        if (validationSchema[fieldName] === undefined) {
            return undefined
        }

        switch(validationSchema[fieldName].type.toUpperCase()) {
            case STRING_TYPE: 
                return validateString(value, fieldPath, validationSchema)
            case NUMBER_TYPE: 
                return validateNumber(value, fieldPath, validationSchema)
            case ARRAY_TYPE:
                if(validationSchema[fieldName].of && addErrorCallback) forEachValidateField([...value], fieldPath, validationSchema[fieldName].of, addErrorCallback)
                return validateArray([...value], fieldPath, validationSchema)
            case OBJECT_TYPE:
                return validateObject(value, fieldPath, validationSchema)
            default: return undefined
        }
    }

    // ARRAY ITEMS VALIDATION
    function forEachValidateField(array, arrayName, validationSchema, addErrorCallback) {
        let validationSchemaFields = Object.getOwnPropertyNames(validationSchema)
        array.forEach((item, index) => {
            let validateFields = Object.getOwnPropertyNames(item)
            validateFields.forEach(x => {
                if(validationSchemaFields.includes(x))
                    addErrorCallback(x, validateField(`${arrayName}[${index}].${x}`, item[x], validationSchema, addErrorCallback))
            })
        })
    }

    // TYPES
    function validateString(value, fieldPath, validationSchema) {
        let fieldSchema = validationSchema[getFieldName(fieldPath)]
        if(!fieldSchema.trim || fieldSchema.trim !== false) value = value.trim()
        return validateType(value, fieldPath, validationSchema, (x) => x > value.length, (x) => x < value.length)
    }

    function validateNumber(value, fieldPath, validationSchema) {
        return validateType(value, fieldPath, validationSchema, (x) => x > value, (x) => x < value)
    }

    function validateArray(value, fieldPath, validationSchema) {
        return validateType(value, fieldPath, validationSchema, (x) => x > value.length, (x) => x < value.length)
    }

    function validateObject(value, fieldPath, validationSchema) {
        let fieldName = getFieldName(fieldPath)
        let fieldSchema = validationSchema[fieldName]

        if(!requiredCheck(value, fieldSchema)) return fieldSchema.required[0]
    }

    // GENERIC TYPE VALIDATION
    function validateType(value, fieldPath, validationSchema, minPred, maxPred) {
        let fieldName = getFieldName(fieldPath)
        let fieldSchema = validationSchema[fieldName]

        if(!requiredCheck(value, fieldSchema)) return fieldSchema.required[0]
        if(fieldSchema.nullable && (value == null || value?.length == 0)) return undefined
        if(fieldSchema.min && !valueCheck(minPred, fieldSchema.min[0])) return fieldSchema.min[1]
        if(fieldSchema.max && !valueCheck(maxPred, fieldSchema.max[0])) return fieldSchema.max[1]
        return undefined
    }

    function requiredCheck(value, fieldSchema) {
        if(fieldSchema.required && fieldSchema.required[0] !== false && (value === undefined || value.length === 0)) {
            return false
        }
        return true
    }

    function valueCheck(strategy, value) {
        if(value !== undefined) {
            if(strategy(value)) {
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

    function reset() {
        setErrors({})
        setIsTouched(false)
    }

    return {
        changeHandle,
        blurHandle,
        validate,
        reset,
        isValid,
        errors
    }
}

// OTHER UTIL
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
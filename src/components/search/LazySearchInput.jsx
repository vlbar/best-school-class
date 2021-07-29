import React, { useState, useRef, useEffect } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'

const LazySearchInput = ({delay = 1200, isCanSubmit = true, isInvalid, isValid, disabled, size, type, initialValue = '', name, onSubmit, onChange, onBlur, onEmpty, onTimerStart, emptyAfterValue, placeholder, variant = 'outline-secondary', isHideButton = false, className, style, children}) => {
    const [value, setValue] = useState(initialValue)
    const lastSubmitedValue = useRef('')
    const notSubmitAfterValue = useRef(undefined)
    const delayTimer = useRef(undefined)

    useEffect(() => {
        if(!isCanSubmit) clearTimeout(delayTimer.current)
    }, [isCanSubmit])

    useEffect(() => {
        notSubmitAfterValue.current = emptyAfterValue
    }, [emptyAfterValue])

    const forceSubmit = (newValue) => {
        clearTimeout(delayTimer.current)
        if(onSubmit) onSubmit(newValue)
    }

    const updateValue = (event) => {
        if(onChange) onChange(event)

        let newValue = event.target.value
        setValue(newValue)       
        if(onEmpty && newValue.length === 0) {
            onEmpty()
            lastSubmitedValue.current = newValue
            clearTimeout(delayTimer.current)
            return
        } 

        if(lastSubmitedValue.current !== newValue && isCanSubmit) {
            if(!newValue.includes(notSubmitAfterValue.current)) {
                notSubmitAfterValue.current = undefined
                lastSubmitedValue.current = newValue
                if(onTimerStart) onTimerStart()

                clearTimeout(delayTimer.current)
                delayTimer.current = setTimeout(() => {
                    forceSubmit(newValue)
                }, delay)
            }
        }
    }

    let input = (
        <Form.Control
            placeholder={placeholder}
            name={name}
            onChange={(e) => updateValue(e)}
            onBlur={(e) => onBlur(e)}
            value={value}

            isInvalid={isInvalid}
            isValid={isValid}
            disabled={disabled}
            size={size}
            type={type}
            className={className}
            style={style}
        />
    )

    return isHideButton 
        ? (<>{input}{children}</>)
        : (<InputGroup className='mr-2' size={size}>
            {input}
            {children}
            <div className='input-group-append'>
                <Button 
                    variant={variant}
                    onClick={() => forceSubmit(value)}
                    className={className}
                    style={style}
                >
                    <i className='fas fa-search'/>
                </Button>
            </div>
        </InputGroup>)
}

export default LazySearchInput
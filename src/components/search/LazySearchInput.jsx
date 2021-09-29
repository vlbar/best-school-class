import React, { useState, useRef, useEffect } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'

const LazySearchInput = ({
    delay = 1200, isCanSubmit = true, isHideButton = false, initialValue = '',
    isInvalid, isValid, disabled, size, type, name, variant = 'outline-secondary', className, style,
    onSubmit, onChange, onBlur, onEmpty, onTimerStart, 
    emptyAfterValue,
    children, ...props
}) => {
    const [value, setValue] = useState(initialValue)
    const lastSubmitedValue = useRef('')
    const notSubmitAfterValue = useRef(undefined)
    const delayTimer = useRef(undefined)
    const isMount = useRef(false)

    useEffect(() => {
        if(isMount.current) {
            if(!isCanSubmit) clearTimeout(delayTimer.current)
            else updateValue(value)
        }
        isMount.current = true
    }, [isCanSubmit])

    useEffect(() => {
        notSubmitAfterValue.current = emptyAfterValue
    }, [emptyAfterValue])

    const forceSubmit = (newValue) => {
        clearTimeout(delayTimer.current)
        if(onSubmit) onSubmit(newValue)
    }

    const onChagneHadler = (event) => {
        let newValue = event.target.value
        setValue(newValue)   

        if(onChange) onChange(event)
        updateValue(newValue)
    }

    const updateValue = (newValue) => {
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
                if(onTimerStart) onTimerStart(newValue)

                clearTimeout(delayTimer.current)
                delayTimer.current = setTimeout(() => {
                    forceSubmit(newValue)
                }, delay)
            }
        }
    }

    let inputStyle = (isHideButton) && style
    let input = (
        <Form.Control
            name={name}
            onChange={(e) => onChagneHadler(e)}
            onBlur={(e) => { if(onBlur) onBlur(e) }}
            value={value}
            
            isInvalid={isInvalid}
            isValid={isValid}
            disabled={disabled}
            size={size}
            type={type}
            {...props}

            className={(isHideButton) && className}
            style={{...inputStyle}}
        />
    )

    return isHideButton 
        ? (<>{input}{children}</>)
        : (<InputGroup className={'mr-2 ' + className} style={style} size={size}>
            {input}
            <div className='input-group-append'>
                <Button 
                    onClick={() => {
                        if(lastSubmitedValue.current !== value && isCanSubmit)
                            forceSubmit(value)
                    }}
                    variant={variant}
                >
                    <i className='fas fa-search'/>
                </Button>
            </div>
            {children}
        </InputGroup>)
}

export default LazySearchInput
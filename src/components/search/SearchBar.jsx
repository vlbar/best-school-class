import React, { useEffect, useRef, useState } from "react";
import { Form } from "react-bootstrap";
import { IoSearchOutline, IoCloseOutline } from "react-icons/io5";

import "./search-bar.less";

const SerachBar = ({
    delay = 1200,
    canSubmit = true,
    initialValue = "",
    isValid,
    className,
    onSubmit,
    onChange,
    onBlur,
    onEmpty,
    onTimerStart,
    emptyAfterValue,
    placeholder,
    children,
    ...props
}) => {
    const [value, setValue] = useState(initialValue);

    const lastSubmitedValue = useRef("");
    const notSubmitAfterValue = useRef(undefined);
    const delayTimer = useRef(undefined);

    useEffect(() => {
        if (canSubmit) {
            debounceChange(value);
        }
    }, [canSubmit]);

    useEffect(() => {
        notSubmitAfterValue.current = emptyAfterValue
    }, [emptyAfterValue])

    const onChagneHadler = event => {
        let newValue = event.target.value;
        setValue(newValue);

        onChange?.(event);
        debounceChange(newValue);
    };

    const handleSubmit = e => {
        e.preventDefault();
        if (canSubmit && lastSubmitedValue.current !== value && !value.includes(notSubmitAfterValue.current)) {
            onSubmit?.(value);
        }
    };

    const debounceChange = value => {
        if (value.length === 0) {
            if (onEmpty) onEmpty(value);
            else onSubmit(value);

            lastSubmitedValue.current = value;
            clearTimeout(delayTimer.current);
            return;
        }

        if (canSubmit && lastSubmitedValue.current !== value && !value.includes(notSubmitAfterValue.current)) {
            notSubmitAfterValue.current = undefined;
            lastSubmitedValue.current = value;
            onTimerStart?.(value);

            clearTimeout(delayTimer.current);
            delayTimer.current = setTimeout(() => {
                clearTimeout(delayTimer.current);
                onSubmit(value);
            }, delay);
        }
    };

    return (
        <Form onSubmit={handleSubmit} className={className}>
            <div className="search-bar">
                <IoSearchOutline size={21} className="search" />
                <input type="text" placeholder={placeholder} value={value} onChange={onChagneHadler} onBlur={() => onBlur?.(value)} {...props} />
                {value.length > 0 && <IoCloseOutline size={18} className="clear" onClick={() => onChagneHadler({ target: { value: "" } })} />}
                {children}
            </div>
        </Form>
    );
};

export default SerachBar;

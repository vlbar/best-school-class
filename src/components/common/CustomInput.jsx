import React from "react";

import "./input-field.less";

const CustomInput = ({ field, form, label, errorMessage, placeholder, onChange, className, children, ...props }) => {
    let placeholderText = placeholder;
    if (!placeholderText) placeholderText = `Введите ${label.toLowerCase()}...`;

    return (
        <div className="input-field">
            <p className="label">{label}</p>
            {children}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default CustomInput;

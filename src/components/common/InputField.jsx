import React from "react";

import "./input-field.less";

const InputField = ({ field, form, label, errorMessage, placeholder, className, right, ...props }) => {
    let placeholderText = placeholder;
    if (!placeholderText) placeholderText = `Введите ${label.toLowerCase()}...`;

    return (
        <div className={'input-field '+ className}>
            <p className="label">{label}</p>
            <div className="input-row">
                <input placeholder={placeholderText} {...field} {...props} />
                {right}
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default InputField;

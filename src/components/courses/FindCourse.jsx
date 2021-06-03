import React from 'react'

export const FindCourse = () => {
    return (
        <div className="input-group my-3">
            <input type="text" className="form-control" placeholder="Введите название курса" aria-label="Введите название курса" aria-describedby="basic-addon2"/>
            <div className="input-group-append">
                <button className="btn btn-outline-secondary" type="button">Найти</button>
            </div>
        </div>
    )
}
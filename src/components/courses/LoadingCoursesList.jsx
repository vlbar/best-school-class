import React from 'react'
import './LoadingCoursesList.less'

export const LoadingCoursesList = () => {
    return (
        <div className="fake-courses-container">
            <div className="fake-course" style={{width: '20%'}}></div>
            <div className="fake-course" style={{width: '70%'}}></div>
            <div className="fake-course" style={{width: '50%'}}></div>
            <div className="fake-course" style={{width: '40%'}}></div>
            <div className="fake-course" style={{width: '60%'}}></div>
        </div>
    )
}
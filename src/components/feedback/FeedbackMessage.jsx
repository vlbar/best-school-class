import React, { useState, useEffect } from 'react'
import './FeedbackMessage.less'

const FeedbackMessage = ({valid = false, message, className, style}) => {
    const [isShow, setIsShow] = useState(false)

    useEffect(() => {
        if(message instanceof Array) {
            let isHasMessage = false
            message.forEach(x => { if(x) isHasMessage = true })
            setIsShow(isHasMessage)
        } else 
            setIsShow(message !== undefined)
    }, [message])

    const getMessage = () => {
        if(message instanceof Array) 
            return message.map((x, index) => 
                <p key={index}>{x}</p>
            )
        else 
            return (<p>{message}</p>)
    }

    return (
        <>
            {(isShow) &&
                <div className={'feedback' + (valid ? ' valid' :'') + (className != null ? (` ${className}`) : '')} style={style}>
                    {getMessage()}
                </div>
            }
        </>
    )
}

export default FeedbackMessage
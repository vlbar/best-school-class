import React from 'react'
import { useParams } from 'react-router-dom'

function Task() {
    const { courseId, taskId } = useParams()

    return (
        <div>Task...</div>
    )
}

export default Task;
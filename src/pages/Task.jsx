import React from 'react'
import { useParams } from 'react-router-dom'
import { TaskEditor } from '../components/tasks/edit/TaskEditor'

function Task() {
    const { courseId, taskId } = useParams()

    return (
        <TaskEditor taskId={taskId}/>
    )
}

export default Task;
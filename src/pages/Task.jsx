import React from 'react'
import { useParams } from 'react-router-dom'
import { TaskEditor } from '../components/tasks/edit/TaskEditor'
import { TaskSaveManager } from '../components/tasks/edit/TaskSaveManager'

function Task() {
    const { courseId, taskId } = useParams()

    return (
        <TaskSaveManager autoSaveDelay={20000}>
            <TaskEditor taskId={Number(taskId)}/>
        </TaskSaveManager>
    )
}

export default Task;
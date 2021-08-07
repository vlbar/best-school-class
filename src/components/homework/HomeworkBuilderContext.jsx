import React, { useState } from 'react'

export const HomeworkContext = React.createContext()

const HomeworkBuilderContext = ({children}) => {
    const [tasks, setTasks] = useState([])

    function addTask(task) {
        setTasks([tasks, ...task])
    }

    function removeTask(task) {
        
    }

    return (
        <HomeworkContext.Provider value={{tasks, addTask, removeTask}}>
            {children}
        </HomeworkContext.Provider>
    )
}

export default HomeworkBuilderContext
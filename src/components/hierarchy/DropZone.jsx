import React, { useEffect, useState } from 'react'
import './DropZone.less'

export const DropZone = ({indent, onDropHandler, upperNode, forceExpandHandler, onDragEnter, onDragExit}) => {
    const [isOver, setIsOver] = useState(false)
    let previousCanExpanded = false
    let isExpandOver = false
    let expandTimer
    
    if(upperNode?.child.length > 0) previousCanExpanded = true;

    //force expond upper node
    useEffect(() => {
        if(previousCanExpanded) {
            if(isOver && !upperNode.isExpanded) {
                isExpandOver = true
                expandTimer = setTimeout(() => {
                    if(isExpandOver) forceExpandHandler(upperNode.id, true)
                }, 1000)
            }
        }
    }, [isOver])

    useEffect(() => {
        return () => {
            isExpandOver = false
            clearTimeout(expandTimer)
        }
    })

    //dragging
    const dragEnter = () => {
        setIsOver(true)
        if(onDragEnter !== undefined) onDragEnter()
    }

    const dragOver = (event) => {
        event.preventDefault()
    }

    const dragLeave = () => {
        isExpandOver = false
        setIsOver(false)
        if(onDragExit !== undefined) onDragExit()
    }

    const onDrop = (event) => {
        onDropHandler(event, upperNode)
        dragLeave()
    }

    return (
        <div className={'drop-zone' + (isOver ? ' drop-over':'')} 
            style={{left: indent || 0}}
            onDragEnter={dragEnter}
            onDragOver={dragOver}
            onDragLeave={dragLeave}
            onDrop={onDrop}
        >
            <div className="place-zone" style={{left: (indent === undefined ? '3Rem' : 0)}}></div>
        </div>
    )
}
import React, { useState, useRef } from 'react'
import './DropZone.less'

export const DropZone = ({indent, onDropHandler, upperNode, forceExpandHandler, onDragEnter, onDragExit}) => {
    const [isOver, setIsOver] = useState(false)
    const expandTimerRef = useRef(null)
    let previousCanExpanded = false

    if(upperNode !== undefined && (upperNode.child.length > 0 || upperNode.isEmpty !== undefined && !upperNode.isEmpty)) 
    { 
        previousCanExpanded = true
    }

    //dragging
    const dragEnter = () => {
        setIsOver(true)

        if(previousCanExpanded) {
            if(!upperNode.isExpanded) {
                expandTimerRef.current = setTimeout(() => {
                    forceExpandHandler(upperNode, true)
                }, 800)
            }
        }

        if(onDragEnter !== undefined) onDragEnter()
    }

    const dragOver = (event) => {
        if(previousCanExpanded && !upperNode.isExpanded && upperNode.isFetched !== undefined && !upperNode.isFetched) return
        event.preventDefault()
    }

    const dragLeave = () => {
        setIsOver(false)
        if(expandTimerRef.current) clearTimeout(expandTimerRef.current);
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
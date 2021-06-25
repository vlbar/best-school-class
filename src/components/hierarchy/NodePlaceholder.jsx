import React, { useEffect, useState } from 'react'
import { DropZone } from './DropZone'
import './NodePlaceholder.less'

export const NodePlaceholder = ({onDragLeaveHandle, insteadNode, upperNode, forceExpandHandler, draggedNodeData, dropHandle}) => {
    const [isOver, setIsOver] = useState(false)

    //constructor
    let previousDepthNodes = []
    if(upperNode !== undefined) {    
        let node = upperNode
        previousDepthNodes.push(node)

        while(node.child.length > 0 && node.isExpanded) {
            let childNode = node.child[node.child.length - 1]
            if(draggedNodeData !== undefined && childNode.id == draggedNodeData.id)
                if(node.child[node.child.length - 2] !== undefined)
                    childNode = node.child[node.child.length - 2]
                else 
                    break

            previousDepthNodes.push(childNode)
            node = childNode
        }
    }

    //fast mouse detecter
    useEffect(() => {
        let timer = setTimeout(() => {
            if(!isOver) 
                if(onDragLeaveHandle !== undefined) 
                    onDragLeaveHandle()
        }, 200)

        return () => {
            clearTimeout(timer)
        }
    })

    //dragging
    const dragOver = (event) => {
        setIsOver(true)
    }

    //cringe detector/detected
    const dragLeave = (event) => {
        if(!event.relatedTarget?.classList.contains('drop-zone'))
            if(onDragLeaveHandle !== undefined)
                onDragLeaveHandle()
    }

    const dropParallel = (event) => {
        if(insteadNode !== undefined)
            dropHandle(insteadNode.parentId, insteadNode.position)
        else
            dropHandle(null, upperNode.position + 1)
    }

    const dropAsChild = (event, parendNode) => {
        let pos = parendNode.child.length > 0
            ? parendNode.child[parendNode.child.length - 1].position + 1 
            : 1
        dropHandle(parendNode.id, pos)
    }

    //
    const getMaxDepth = (node) => {
        let maxDepth = 0
        for(let child of node.child) {
            let regDepth = 1
            if(child.child.length > 0) 
                regDepth = getMaxDepth(child) + 1

            if(regDepth > maxDepth) maxDepth = regDepth
        }

        return maxDepth
    }

    return (
        <div className="placeholder-root" 
            onDragOver={(e) => dragOver(e)} 
            onDragLeave={(e) => dragLeave(e)}
        >
            <div 
                    className="hover-catcher"
                    onDragOver={(e) => dragOver(e)}
                    onDragLeave={(e) => dragLeave(e)}
            >
                <DropZone onDropHandler={dropParallel}/>
                {previousDepthNodes.map((node, index) => {
                    return <DropZone 
                        key={index}
                        indent={`${4.6+2*(index)}Rem`}
                        upperNode={node}
                        onDropHandler={dropAsChild}
                        forceExpandHandler={forceExpandHandler}
                    />
                })}
            </div>
        </div>
    )
}
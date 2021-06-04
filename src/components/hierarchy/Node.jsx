import React, { useState } from 'react'
import { Dropdown } from 'react-bootstrap'
import { NodePlaceholder } from './NodePlaceholder'
import './Node.less'

const MOVE_UP = 'UP'
const MOVE_DOWN = 'DOWN'

export const Node = ({nodeData, upperNodeData, lowerNodeData, draggedNodeData, dragStartHandle, dragEndHandle, moveNodeHandler, deleteNodeHandler, addNodeHandler, setExpandedHandler, fetchDataHandler, canNodeDrag, onNodeClick}) => {
    const [isDragOver, setIsDragOver] = useState(false)
    const [isDrag, setDrag] = useState(false)
    const [isCanDrag, setCanDrag] = useState(false)

    const [isOpenDropdown, setIsOpenDropdown] = useState(false)

    //=====================DRAGGING==========================
    const dragStart = (event, id) => {
        if(canNodeDrag) {
            setIsDragOver(false)
            setCanDrag(false)
            event.dataTransfer.setData('text/plain', event.target.dataset.id)
            event.dataTransfer.effectAllowed = 'move'

            setTimeout(() => {
                setDrag(true)
            }, 0);

            dragStartHandle(nodeData)
        }
    }

    const dragEnd = (event) => {
        setDrag(false)
        dragEndHandle(event.dataTransfer.dropEffect)
    }

    const dragEnter = () => { 
        if(canNodeDrag)
            if(!isDrag) 
                setIsDragOver(true) 
    }

    const dragLeave = () => { 
        setIsDragOver(false) 
    }

    //other
    const onClick = () => {
        if(onNodeClick !== undefined)
            onNodeClick(nodeData.id)
    }

    const moveNode = (direction) => {
        switch (direction) {
            case MOVE_UP:
                moveNodeHandler(nodeData.parentId, upperNodeData.position, nodeData)
                break
            case MOVE_DOWN:
                moveNodeHandler(nodeData.parentId, lowerNodeData.position + 1, nodeData)
                break
        }
    }

    //=====================Render========================
    const collapseList = () => {
        setExpandedHandler(nodeData.id, !nodeData.isExpanded)
        if(fetchDataHandler !== undefined && !nodeData.isFetched) fetchDataHandler(nodeData.id)
    }

    const openDropdown = (isOpen) => setIsOpenDropdown(isOpen)

    const onDrop = (targetParentId, position) => {
        setIsDragOver(false)
        moveNodeHandler(targetParentId, position)
    }

    if(nodeData.isExpanded && !nodeData.isFetched && fetchDataHandler !== undefined && !nodeData.isFetched) fetchDataHandler(nodeData.id)

    // decringelization of render
    const upperNode = (index) => {
        if (draggedNodeData !== undefined 
            && subNodes[index - 1] !== undefined 
            && subNodes[index - 1].id == draggedNodeData.id) 
        return subNodes[index - 2]  
        else return subNodes[index - 1]
    }

    
    let subNodes = nodeData.child
    let expandShow = (fetchDataHandler === undefined && subNodes.length !== 0) || (fetchDataHandler !== undefined && (!nodeData.isFetched || subNodes.length !== 0))
    return (
        <>
            {isDragOver ?
                <NodePlaceholder 
                    insteadNode={nodeData}
                    upperNode={upperNodeData}
                    forceExpandHandler={setExpandedHandler}
                    draggedNodeData={draggedNodeData}
                    onDragLeaveHandle={dragLeave}
                    dropHandle={onDrop}
                />
            : ''}
            <div className={'node' + (isOpenDropdown ? ' node-hover':'') + (isDrag ? ' hidden':'')} onDragOver={dragEnter} >
                <div 
                    className={'node-content' + (!nodeData.isExpanded ? ' node-collapse' : '')} 
                    data-id={nodeData.name} 
                    draggable={isCanDrag} 
                    onDragStart={(e) => dragStart(e, nodeData.id)} 
                    onDragEnd={(e) => dragEnd(e)}
                >
                    {canNodeDrag ?
                        <div 
                            className='handle'
                            onMouseEnter={() => setCanDrag(true)} 
                            onMouseLeave={() => setCanDrag(false)}
                        >
                            <svg width='18' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M20 18h8v-6h6l-10-10-10 10h6v6zm-2 2h-6v-6l-10 10 10 10v-6h6v-8zm28 4l-10-10v6h-6v8h6v6l10-10zm-18 6h-8v6h-6l10 10 10-10h-6v-6z'/>
                            </svg>
                        </div>
                    :''}
                    <div className='arrow' onClick={collapseList}>
                        {expandShow ? 
                            <svg width='21' viewBox='0 0 24 24'  xmlns='http://www.w3.org/2000/svg'>
                                <path d='M7 10l5 5 5-5z'/>
                            </svg> 
                        : ''}
                    </div>
                    <span className='node-text' onClick={onClick}>{nodeData.name}</span>
                    <Dropdown onToggle={(isOpen) => openDropdown(isOpen)}>
                        <Dropdown.Toggle size='sm' variant='best' id='dropdown-basic'>⋮</Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => addNodeHandler(nodeData)} disabled={addNodeHandler === undefined}>Добавить подкурс</Dropdown.Item>
                            {canNodeDrag ? 
                            <>
                                <Dropdown.Item onClick={() => moveNode(MOVE_UP)} disabled={upperNodeData === undefined}>Переместить выше</Dropdown.Item>
                                <Dropdown.Item onClick={() => moveNode(MOVE_DOWN)} disabled={lowerNodeData === undefined}>Переместить ниже</Dropdown.Item>
                            </>: ''}
                            <Dropdown.Item onClick={() => deleteNodeHandler(nodeData)} disabled={deleteNodeHandler === undefined} className='text-danger'>Удалить</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            {nodeData.isExpanded && !isDrag ?
                <div className={'sub-nodes'}>
                    {(subNodes.length !== 0) ? subNodes.map((nodeData, index) => {
                        return <Node key={nodeData.id} 
                            upperNodeData={upperNode(index)}
                            nodeData={nodeData}
                            lowerNodeData={subNodes[index + 1]}
                            setExpandedHandler={setExpandedHandler}
                            fetchDataHandler={fetchDataHandler}
                            draggedNodeData={draggedNodeData}
                            dragStartHandle={dragStartHandle}
                            dragEndHandle={dragEndHandle}
                            deleteNodeHandler={deleteNodeHandler}
                            addNodeHandler={addNodeHandler}
                            moveNodeHandler={moveNodeHandler}
                            canNodeDrag={canNodeDrag}
                            onNodeClick={onNodeClick}
                        />
                    }):''}
                </div>
            :''}
        </>
    )
}
import React, { useState, useEffect } from 'react'
import { Dropdown } from 'react-bootstrap'
import { NodePlaceholder } from './NodePlaceholder'
import { useInView } from 'react-intersection-observer'
import AnimateHeight from 'react-animate-height'
import './Node.less'

const MOVE_UP = 'UP'
const MOVE_DOWN = 'DOWN'

export const Node = ({nodeData, upperNodeData, lowerNodeData, draggedNodeData, dragStartHandle, dragEndHandle, moveNodeHandler, updateNodeHandler, deleteNodeHandler, addNodeHandler, setExpandedHandler, fetchSubNodesHandler, canNodeDrag, selectedNode, onNodeClick}) => {
    const [isDragOver, setIsDragOver] = useState(false)
    const [isDrag, setDrag] = useState(false)
    const [isCanDrag, setCanDrag] = useState(false)

    const [treePagination, setTreePagination] = useState({
        page: 1, 
        pageSize: undefined, 
        total: undefined
    })
    const [isFetching, setIsFetching] = useState(false)
    const { ref, inView } = useInView({
        threshold: 1,
    });

    const [isOpenDropdown, setIsOpenDropdown] = useState(false)

    useEffect(() => {
        if(fetchSubNodesHandler && inView && !isFetching) fetchSubNodes(treePagination.page + 1)
    }, [inView])

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
        if(canNodeDrag && draggedNodeData != null)
            if(!isDrag) 
                setIsDragOver(true) 
    }

    const dragLeave = () => { 
        setIsDragOver(false) 
    }

    //other
    const onClick = () => {
        if(onNodeClick !== undefined)
            onNodeClick(nodeData)
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

    const fetchSubNodes = async (page) => {
        setIsFetching(true)
        let fetchData = await fetchSubNodesHandler(nodeData, page)
        setTreePagination({
            page: fetchData.page,
            pageSize: fetchData.size,
            total: fetchData.total
        })
        setIsFetching(false)
    }

    //=====================Render========================
    const collapseList = () => {
        if(fetchSubNodesHandler !== undefined && !nodeData.isFetched && !nodeData.isEmpty) 
            fetchSubNodes(1)
        else
            setExpandedHandler(nodeData, !nodeData.isExpanded)
    }

    const openDropdown = (isOpen) => setIsOpenDropdown(isOpen)

    const onDrop = (targetParentId, position) => {
        setIsDragOver(false)
        moveNodeHandler(targetParentId, position)
    }

    // decringelization of render
    const upperNode = (index) => {
        if (draggedNodeData !== undefined 
            && subNodes[index - 1] !== undefined 
            && subNodes[index - 1].id == draggedNodeData.id) 
        return subNodes[index - 2]  
        else return subNodes[index - 1]
    }

    let subNodes = nodeData.child
    let expandShow = subNodes.length !== 0 || (fetchSubNodesHandler !== undefined && nodeData.isEmpty !== undefined && !nodeData.isEmpty)
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
            <div className={'node' + (isOpenDropdown ? ' node-hover':'') + (isDrag ? ' hidden':'') + (selectedNode ? selectedNode.id == nodeData.id ? ' selected':'':'')} onDragOver={dragEnter} >
                <div 
                    className={'node-content' + (!nodeData.isExpanded ? ' node-collapse' : '')} 
                    data-id={nodeData.name} 
                    draggable={isCanDrag} 
                    onDragStart={(e) => dragStart(e, nodeData.id)} 
                    onDragEnd={(e) => dragEnd(e)}
                >
                    {canNodeDrag &&
                        <div 
                            className='handle'
                            onMouseEnter={() => setCanDrag(true)} 
                            onMouseLeave={() => setCanDrag(false)}
                        >
                            <svg width='18' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'>
                                <path d='M20 18h8v-6h6l-10-10-10 10h6v6zm-2 2h-6v-6l-10 10 10 10v-6h6v-8zm28 4l-10-10v6h-6v8h6v6l10-10zm-18 6h-8v6h-6l10 10 10-10h-6v-6z'/>
                            </svg>
                        </div>
                    }
                    <div className='arrow' onClick={collapseList}>
                        {expandShow ? 
                            <svg width='21' viewBox='0 0 24 24'  xmlns='http://www.w3.org/2000/svg'>
                                <path d='M7 10l5 5 5-5z'/>
                            </svg> 
                        : ''}
                    </div>
                    <span className='node-text' onClick={onClick}>{nodeData.name}</span>
                    {(addNodeHandler && updateNodeHandler && canNodeDrag && deleteNodeHandler) &&
                        <Dropdown onToggle={(isOpen) => openDropdown(isOpen)}>
                            <Dropdown.Toggle size='sm' variant='best' id='dropdown-basic'>⋮</Dropdown.Toggle>
                            <Dropdown.Menu>
                                {addNodeHandler && <Dropdown.Item onClick={() => addNodeHandler(nodeData)}>Добавить подкурс</Dropdown.Item>}
                                {updateNodeHandler && <Dropdown.Item onClick={() => updateNodeHandler(nodeData)}>Изменить</Dropdown.Item>}
                                {canNodeDrag && 
                                <>
                                    <Dropdown.Item onClick={() => moveNode(MOVE_UP)} disabled={upperNodeData === undefined}>Переместить выше</Dropdown.Item>
                                    <Dropdown.Item onClick={() => moveNode(MOVE_DOWN)} disabled={lowerNodeData === undefined}>Переместить ниже</Dropdown.Item>
                                </>}
                                {deleteNodeHandler && <Dropdown.Item onClick={() => deleteNodeHandler(nodeData)} className='text-danger'>Удалить</Dropdown.Item>}
                            </Dropdown.Menu>
                        </Dropdown>
                    }
                </div>
            </div>
            {expandShow &&
                <div className={'sub-nodes'}>
                    <AnimateHeight
                        animateOpacity
                        duration={220}
                        height={nodeData.isExpanded && !isDrag ? 'auto' : 0}
                    >
                        {(subNodes.length !== 0) && subNodes.map((nodeData, index) => {
                            return <Node key={nodeData.id} 
                                upperNodeData={upperNode(index)}
                                nodeData={nodeData}
                                lowerNodeData={subNodes[index + 1]}
                                setExpandedHandler={setExpandedHandler}
                                fetchSubNodesHandler={fetchSubNodesHandler}
                                draggedNodeData={draggedNodeData}
                                dragStartHandle={dragStartHandle}
                                dragEndHandle={dragEndHandle}
                                updateNodeHandler={updateNodeHandler}
                                deleteNodeHandler={deleteNodeHandler}
                                addNodeHandler={addNodeHandler}
                                moveNodeHandler={moveNodeHandler}
                                canNodeDrag={canNodeDrag}
                                selectedNode={selectedNode}
                                onNodeClick={onNodeClick}
                            />
                        })}
                        {(fetchSubNodesHandler && treePagination.page * treePagination.pageSize < treePagination.total) &&
                            <button 
                                className="fetch-nodes-btn" 
                                onClick={() => fetchSubNodes(treePagination.page + 1)} 
                                disabled={isFetching} 
                                ref={ref}
                            >
                                {isFetching ? '. . .' : 'Загрузить еще'}
                            </button>
                        }
                    </AnimateHeight>
                </div>
            }
        </>
    )
}
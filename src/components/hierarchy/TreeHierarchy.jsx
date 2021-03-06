import React, { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Node } from './Node';
import { NodePlaceholder } from './NodePlaceholder';

/* Node data interface 
    id            int
    parentId      int
    name          string
    position      int
    isExpanded    bool
    isFetched     bool     (optional without fetchDataHandler)
    isEmpty       bool     (optional without fetchDataHandler)
    child         array
*/

/*
    onNodeMove(dragNodeId, parentId, position)
    fetchNodesHandler(parentId): { items: array, page: int, size: int, total: int }
    fetchSubNodesHandler(parentId): { items: array, page: int, size: int, total: int }  (optional if called the same as in 'fetchNodesHandler')
*/

export const TreeHierarchy = ({treeData, setTreeData, fetchNodesHandler, fetchSubNodesHandler, onNodeMove, onNodeUpdate, onNodeDelete, onNodeAdd, onNodeClick, canNodeDrag = true}) => {
    const [treePagination, setTreePagination] = useState({
        page: 1, 
        pageSize: undefined, 
        total: undefined
    })

    const [isFetching, setIsFetching] = useState(false)
    const { ref, inView } = useInView({
        threshold: 1,
    });

    const [draggedNode, setDraggedNode] = useState(undefined)
    const [selectedNode, setSelectedNode] = useState(undefined)

    let flatTreeData = treeToFlat(treeData)

    useEffect(() => {
        if(fetchNodesHandler !== undefined && !treeData) fetchNodes(null, 1)
    }, [])

    useEffect(() => {
        if(fetchNodesHandler && inView && !isFetching) fetchNodes(null, treePagination.page + 1)
    }, [inView])

    // dragging
    const dragStart = (node) => {
        setDraggedNode(node)     
    }

    const dragEnd = (result) => {
        setDraggedNode(undefined)
    }

    // force expand
    const setIsExpandedHandler = (node, isExpanded) => {
        if(fetchNodesHandler !== undefined && !node.isFetched) {
            fetchNodes(node, 1)
        } else {
            node.isExpanded = isExpanded
            setTreeData(flatTreeData.filter(x => x.parentId == null))
        }
    }

    // fetch data
    const fetchNodes = async (node, page) => {
        setIsFetching(true)
        if(node !== null) {
            fetchSubNodes(node, page)
        } else {
            let fetchData = await fetchNodesHandler(node, page)
            setTreePagination({
                page: fetchData.page,
                pageSize: fetchData.size,
                total: fetchData.total
            })
            if(treeData === undefined)
                setTreeData(fetchData.items)
            else
                setTreeData([...treeData, ...fetchData.items])
        }
        setIsFetching(false)
    }

    const fetchSubNodes = async (node, page) => {
        node.isFetched = true //anti ddos
        let fetchData = await fetchSubNodesHandler(node, page)
        let nodeChilds = node.child
        node.child = [...nodeChilds, ...fetchData.items]
        node.isExpanded = true
        setTreeData(flatTreeData.filter(x => x.parentId == null))
        return fetchData
    }

    //
    //WARNING! The likelihood of getting an attack of CRINGE! Be careful!
    //
    const moveNodeHandler = (targetParentId, position, draggedNodeData) => {
        let dragNode = draggedNodeData || draggedNode
        let newTreeData = treeData

        if (dragNode.id == targetParentId) return
        if (dragNode.parentId == targetParentId && dragNode.position == position) return

        if (dragNode.parentId != null) { 
            let dragNodeParent = flatTreeData.find(x => x.id === dragNode.parentId)
            dragNodeParent.child = dragNodeParent.child.filter(x => x !== dragNode)
            if(fetchNodesHandler !== undefined) dragNodeParent.isEmpty = dragNodeParent.child.length == 0
        } else {
            newTreeData = treeData.filter(x => x !== dragNode)
        }

        let targetChildrens = undefined
        if (targetParentId != null) {
            let parentNode = flatTreeData.find(x => x.id === targetParentId)
            targetChildrens = parentNode.child
            if(targetChildrens.length == 0) { 
                parentNode.isExpanded = true
                if(parentNode.isFetched !== undefined) parentNode.isFetched = true
            }
        } else {
            targetChildrens = newTreeData
        }

        targetChildrens.filter(x => x.position >= position).forEach(x => x.position++)

        dragNode.position = position
        dragNode.parentId = targetParentId
        targetChildrens.push(dragNode)
        targetChildrens.sort((a,b) => (a.position > b.position) ? 1 : -1)

        setTreeData([...newTreeData])
        setDraggedNode(undefined)

        if (onNodeMove !== undefined) onNodeMove(dragNode.id, targetParentId, position)
    }

    // decringelization of render
    const upperNode = (index) => {
        if (draggedNode !== undefined 
            && treeData[index - 1] !== undefined 
            && treeData[index - 1].id == draggedNode.id) 
        return treeData[index - 2]  
        else return treeData[index - 1]
    }

    const onNodeSelect = (node) => {
        if(selectedNode !== node) {
            setSelectedNode(node)
            onNodeClick(node)
        }
    }

    return (
        <div className={'tree-hierarchy' + (draggedNode !== undefined ? ' disable-hover':'')}>
            {treeData !== undefined && treeData.map((nodeData, index) => {
                return <Node key={nodeData.id} 
                    upperNodeData={upperNode(index)}
                    nodeData={nodeData}
                    lowerNodeData={treeData[index + 1]}
                    setExpandedHandler={setIsExpandedHandler}
                    fetchSubNodesHandler={fetchSubNodes}
                    draggedNodeData={draggedNode}
                    dragStartHandle={dragStart}
                    dragEndHandle={dragEnd}
                    addNodeHandler={onNodeAdd}
                    updateNodeHandler={onNodeUpdate}
                    deleteNodeHandler={onNodeDelete}
                    moveNodeHandler={moveNodeHandler}
                    canNodeDrag={canNodeDrag}
                    selectedNode={selectedNode}
                    onNodeClick={onNodeSelect}
                />
            })}
            {draggedNode && <NodePlaceholder
                insteadNode={undefined}
                upperNode={treeData[treeData.length - 1] == draggedNode 
                    ? treeData[treeData.length - 2]
                    : treeData[treeData.length - 1]}
                forceExpandHandler={setIsExpandedHandler}
                dropHandle={(targetParentId, position) => moveNodeHandler(targetParentId, position)}
            />}
            {(fetchNodesHandler && treePagination.page * treePagination.pageSize < treePagination.total) &&
                <button 
                    className="fetch-nodes-btn" 
                    onClick={() => fetchNodes(null, treePagination.page + 1)} 
                    disabled={isFetching} 
                    ref={ref}
                >
                    {isFetching ? '. . .' : '?????????????????? ??????'}
                </button>
            }
        </div>
    )
}

// tree flatting
const getAllChilds = (node) => {
    let childrens = []
    let curChilds = node.child
    curChilds.forEach(element => {
        childrens.push(element)
        childrens = childrens.concat(getAllChilds(element))
    });
    return childrens
}

export const treeToFlat = (list) => {
    if(list !== undefined)
        return getAllChilds({child: list})
    else return null
}

export const deleteNode = (node, treeData, setTreeData) => {
    if(!(node.parentId === null || node.parentId === undefined)) {
        let flatTreeData = treeToFlat(treeData)
        let parentNode = flatTreeData.find(x => x.id == node.parentId)
        let parentChilds = parentNode.child
        parentNode.child = parentChilds.filter(x => x.id !== node.id)
        setTreeData(flatTreeData.filter(x => x.parentId == null))
    } else {
        setTreeData(treeData.filter(x => x.id !== node.id))
    }
}
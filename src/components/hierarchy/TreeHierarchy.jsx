import React, { useState } from 'react'
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
    fetchDataHandler(parentId): array
*/

export const TreeHierarchy = ({treeData, setTreeData, fetchDataHandler, onNodeMove, onNodeDelete, onNodeAdd, onNodeClick, canNodeDrag = true}) => {
    const [draggedNode, setDraggedNode] = useState(undefined)

    let flatTreeData = treeToFlat(treeData)

    // dragging
    const dragStart = (node) => {
        setDraggedNode(node)     
    }

    const dragEnd = (result) => {
        setDraggedNode(undefined)
    }

    // force expand
    const setIsExpandedHandler = (node, isExpanded) => {
        if(fetchDataHandler !== undefined && !node.isFetched) {
            fetchData(node)
        } else {
            node.isExpanded = isExpanded
            setTreeData(flatTreeData.filter(x => x.parentId == null))
        }
    }

    // fetch data
    const fetchData = async (node) => {
        node.isFetched = true //anti ddos
        node.child = await fetchDataHandler(node)
        node.isExpanded = true
        setTreeData(flatTreeData.filter(x => x.parentId == null))
    }

    //
    //WARNING! The likelihood of getting an attack of CRINGE! Be careful!
    //
    const moveNodeHandler = (targetParentId, position, draggedNodeData) => {
        let dragNode = draggedNodeData || draggedNode
        let newTreeData = treeData

        if (dragNode.id == targetParentId) return

        if (dragNode.parentId != null) { 
            let dragNodeParent = flatTreeData.find(x => x.id === dragNode.parentId)
            dragNodeParent.child = dragNodeParent.child.filter(x => x !== dragNode)
            if(fetchDataHandler !== undefined) dragNodeParent.isEmpty = dragNodeParent.child.length == 0
        } else {
            newTreeData = treeData.filter(x => x !== dragNode)
        }

        let targetChildrens = undefined
        if (targetParentId != null) {
            let parentNode = flatTreeData.find(x => x.id === targetParentId)
            targetChildrens = parentNode.child
            if(targetChildrens.length == 0) parentNode.isExpanded = true;
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

    // delete node
    const deleteNode = (node) => {
        if(node.parentId !== null) {
            let parentNode = flatTreeData.find(x => x.id == node.parentId)
            let parentChilds = parentNode.child
            parentNode.child = parentChilds.filter(x => x.id !== node.id)
            setTreeData(flatTreeData.filter(x => x.parentId == null))
        } else {
            setTreeData(treeData.filter(x => x.id !== node.id))
        }
        
        if (onNodeDelete !== undefined) onNodeDelete(node)
    }

    // decringelization of render
    const upperNode = (index) => {
        if (draggedNode !== undefined 
            && treeData[index - 1] !== undefined 
            && treeData[index - 1].id == draggedNode.id) 
        return treeData[index - 2]  
        else return treeData[index - 1]
    }

    return (
        <div className={'tree-hierarchy' + (draggedNode !== undefined ? ' disable-hover':'')}>
            {treeData.map((nodeData, index) => {
                return <Node key={nodeData.id} 
                    upperNodeData={upperNode(index)}
                    nodeData={nodeData}
                    lowerNodeData={treeData[index + 1]}
                    setExpandedHandler={setIsExpandedHandler}
                    fetchDataHandler={fetchData}
                    draggedNodeData={draggedNode}
                    dragStartHandle={dragStart}
                    dragEndHandle={dragEnd}
                    addNodeHandler={onNodeAdd}
                    deleteNodeHandler={deleteNode}
                    moveNodeHandler={moveNodeHandler}
                    canNodeDrag={canNodeDrag}
                    onNodeClick={onNodeClick}
                />
            })}
            <NodePlaceholder
                insteadNode={undefined}
                upperNode={treeData[treeData.length - 1] == draggedNode 
                    ? treeData[treeData.length - 2]
                    : treeData[treeData.length - 1]}
                forceExpandHandler={setIsExpandedHandler}
                dropHandle={(targetParentId, position) => moveNodeHandler(targetParentId, position)}
            />
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
    return getAllChilds({child: list})
}
import { isDef } from '../util/index'

export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType;
    // 任何节点相同
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
        // Diff 算法
        patchVnode(oldVnode, vnode)
    } else {
        // 第一次 渲染 一定走这步
        if (isRealElement) {
            const oldElm = oldVnode;
            const parentElm = oldElm.parentNode
            createElm(vnode)
            parentElm.insertBefore(vnode.elm, oldElm.nextSibling)
            parentElm.removeChild(oldElm)  // 替换        
        }
        return vnode.elm
    }

}
function patchVnode(oldVnode, vnode) {
    if (oldVnode === vnode) return
    const elm = vnode.elm = oldVnode.elm
    const data = vnode.data
    const oldCh = oldVnode.children;
    const ch = vnode.children
    // 是个节点
    if (!isDef(vnode.text)) {
        if (isDef(oldCh) && isDef(ch)) {
            // 核心代码
            if (oldCh !== ch) {
                updateChildren(elm, oldCh, ch)
            }
        } else if (isDef(ch)) {
            if (!isDef(oldVnode.text)) elm.textContent = '';
            addVnodes(elm, ch, 0, ch.lenght - 1);
        } else if (isDef(oldCh)) {
            removeVnodes(elm, oldCh)
        } else if (isDef(oldVnode.text)) elm.textContent = '';
    } else if (vnode.text !== oldVnode.text) {
        elm.textContent = vnode.text
    }
}
function updateChildren(parentElm, oldCh, newCh) {
    let oldStartIdx = 0;
    let oldEndIdx = oldCh.length - 1

    let newStartIdx = 0;
    let newEndIdx = newCh.length - 1

    let oldStartVnode = oldCh[0]
    let oldEndVnode = oldCh[oldEndIdx]

    let newStartVnode = newCh[0]
    let newEndVnode = newC[newEndIdx]

    let oldKeyToIdx, idxInOld, vnodeToMove;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
        if (!isDef(oldStartVnode)) {
            oldStartVnode = oldCh[++oldStartIdx]
        } else if (!isDef(oldEndVnode)) {
            oldEndVnode = oldCh[--oldEndVnode]
        } else if (sameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldCh[++oldStartIdx]
            newStartVnode = newCh[++newStartIdx]
        } else if (sameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newStartVnode)
            parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
            oldStartVnode = oldCh[++oldStartIdx]
            newEndVnode = newCh[--newEndIdx]

        } else if (sameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode)
            parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
            oldEndVnode = oldCh[--oldEndIdx]
            newStartVnode = newCh[++newStartIdx]

        } else if (sameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldCh[--oldEndIdx]
            newStartVnode = newCh[--newEndIdx]
        } else {
            // let oldKeyToIdx, idxInOld, vnodeToMove;
            if (!isDef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
            idxInOld = newStartIdx.key ? oldKeyToIdx[newStartIdx.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
            if(isDef(idxInOld)){
                vnodeToMove=oldCh[idxInOld]
                if(sameVnode(vnodeToMove,newStartVnode)){
                    patchVnode(vnodeToMove,newStartVnode)
                    parentElm.insertBefore(newStartVnode.elm,oldStartVnode.elm)
                }else {
                    createElm(newStartVnode)
                }
            }else {
                createElm(newStartVnode)
            }
        }
    }
    // 旧的节点 先遍历完的 新增新的节点
    if(oldStartIdx>oldEndIdx){
        addVnodes(parentElm, newCh, newStartIdx,newEndIdx);   
    // 新的节点先遍历完的,删除旧的节点
    }else if(newStartIdx>newEndIdx){
        removeVnodes(parentElm,oldCh,oldStartIdx,oldEndIdx)
    }
}
function findIdxInOld(node, oldCh, start, end) {
    for (let i = start; i < end; i++) {
        let c = oldCh[i]
        if (isDef(c) && sameVnode(c, node))
            return i
    }

}
function createKeyToOldIdx(children, startIdx, endIdx) {
    const map = {}
    let i
    for (i = startIdx; i < endIdx; i++) {
        key = children[i].key
        if (isDef(key)) map[key] = i
    }
    return map

}
function addVnodes(parentElm, vnode, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
        parentElm.appendChild(createElm(vnode[startIdx]))
    }
}
function removeVnodes(parentElm, vnode, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
        const ch = vnode[startIdx]
        if (isDef(ch)) {
            parentElm.removeChild(ch.elm)
        }
        //parentElm.appendChild(createElm(vnode[startIdx]))
    }
}
function sameVnode(a, b) {
    console.log(a, 'a==')
    console.log(b, 'b==')
    return a.tag === b.tag && isDef(a.data) && isDef(b.data) && sameInputType(a, b)
}
//  <input 的内容 type
function sameInputType(a, b) {
    if (!a.tag !== 'input') return true;
    let i;
    const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type
    const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type
    // 源码还有判断 是否有input 类型
    return typeA === typeB
}

function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag === 'string') {
        vnode.elm = document.createElement(tag)
        updataProperties(vnode)
        if (children) {
            createChildren(vnode, children)
        }
    }
    else {
        vnode.elm = createTextNode(text)
    }
    return vnode.elm
}
function updataProperties(vnode) {
    let newProps = vnode.data
    if (newProps) {
        let elm = vnode.elm;
        for (let key in newProps) {
            if (key === 'style') {
                for (let styleName in newProps[key]) {
                    elm.style[styleName] = newProps[key][styleName]
                }

            } else if (key === 'class') {
                el.className = newProps[key]

            } else {
                elm.setAttribute(key, newProps[key])
            }

        }
    }
}
function createTextNode(text) {
    return document.createTextNode(text);
}
function createChildren(vnode, children) {
    if (Array.isArray(children)) {
        children.forEach(child => {
            vnode.elm.appendChild(createElm(child))
        })
    }
}
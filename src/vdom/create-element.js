import  VNode from '../vdom/vnode'
export function createElement(tag,data={},...children){
    return new VNode(tag,data,children,undefined,undefined)

}

// html->AST语法树 正则表达式 ->render 字符串拼接 ->执行render函数，生成vnode->渲染真实得dom

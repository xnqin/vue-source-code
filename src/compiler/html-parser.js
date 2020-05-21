//  AST语法树  用对象来描述html语法   虚拟dom：用对象来描述dom节点
//  创建语法树 Convert HTML string to AST.
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ //匹配属性id=  "dd" id=  'sss' id=  dd
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*` // abc-abc
const qnameCapture = `((?:${ncname}\\:)?${ncname})`  //?:匹配不捕获<aaa:bb>
const startTagOpen = new RegExp(`^<${qnameCapture}`) //匹配标签开头
const startTagClose = /^\s*(\/?)>/   //匹配/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)  //匹配标签结束 </div>
const doctype = /^<!DOCTYPE [^>]+>/i
// const defaultTagRE=/\{\{\((?:.|\r?\n)+?)}\}/g

let root = null // AST 树根
let currentParent; // 当前父节点
let stack = []; // 栈
let ELEMENT_TYPE = 1 //节点nodetype
let TEXT_TYPE = 3 //文本节点 nodetype
function createASTElement(tag, attrs, parent) {
    return {
        type: ELEMENT_TYPE,
        tag,
        attrs: attrs,
        parent,
        children: []
    }
}
function start(start) {
    let element = createASTElement(start.tagName, start.attrs, currentParent)
    if (!root) {
        root = element
    }
    currentParent = element
    stack.push(element)
}
function end(end) {
    let element = stack.pop()
    if (element.tag === end) {
        currentParent = stack[stack.length - 1]
        if (currentParent) {
            element.parent = currentParent
            currentParent.children.push(element)
        }
    }
}
function char(text) {
    text = text.trim()
    if (text) {
        currentParent.children.push({
            text,
            type: TEXT_TYPE
        })
    }
}

// html -> 对象格式
export function parseHTML(html) {
    while (html) {
        let textEnd = html.indexOf('<')
        // 有可能是开始标签 也有可能是结束标签
        if (textEnd == 0) {
            let startTagMatch = parseStartTag()
            if (startTagMatch) {
                start(startTagMatch)
                continue
            }
            const endTgMatch = html.match(endTag)
            if (endTgMatch) {
                advince(endTgMatch[0].length)
                end(endTgMatch[1])
                continue
            }
        }
        //文本 或者多个空格 
        let text;
        if (textEnd >= 0) {
           text = html.substring(0,textEnd)
        }
        if (text) {
            char(text)
            advince(text.length)
           
        }
    }
    return root
    function parseStartTag() {
        let start = html.match(startTagOpen)
        if (start) {
            advince(start[0].length)
            let match = {
                tagName: start[1],
                attrs: []
            }
            let end, attrs
            while (!(end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
                advince(attrs[0].length)
                match.attrs.push({
                    name: attrs[1],
                    value: attrs[3] || attrs[4] || attrs[5]
                })
            }
            advince(end[0].length)
            return match;
        }

    }
    function advince(n) {
        html = html.substring(n)
    }
}
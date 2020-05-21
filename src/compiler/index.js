import {parseHTML} from './html-parser'

const tagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function genProps(props) {
    let staticProps = ``
    for (let i = 0; i < props.length; i++) {
        const prop = props[i]
        // style="color:red;fontSize:'14px'" -> {style:{color:red;fontsize:14px}}
        if (prop.name === 'style') {
            let obj = {}
            prop.value.split(';').forEach(item => {
                let [key, value ] = item.split(':')
                obj[key] = value
            })
            prop.value = obj
        }
        staticProps += `${prop.name}:${JSON.stringify(prop.value)},`
    };
    return `{${staticProps.slice(0, -1)}}`
}

function genChildren(el){
    let children=el.children
    if(children && children.length>0){
       return  `${children.map(c=>gen(c)).join(',')}`

    }else {
        return false;
    }
}
function gen(node){
    if (node.type === 1) {
      return   generate(node)
    }else {
        return getText(node.text)
    }
}
// a {{name}} b{{age}} c  => 'a'+_s(name)+'b'+_s(age)+'c'
function getText(text){
    let tokens=[];
    let index,match;
    let lastIndex=tagRE.lastIndex=0
    while(match=tagRE.exec(text)){
        index = match.index
        //console.log(match.index,'match.index==')
        if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex,index)))
        }
        tokens.push(`_s(${match[1].trim()})`)
        lastIndex=index+match[0].length
        //console.log(lastIndex,'lastIndex')
    }
    if(lastIndex < text.length){
        tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${tokens.join('+')})`
}
// render 函数 <div id='app'><p>hello {{name}}</p><p>hello</p></div>
//_c：节点  _v：文本 _s:变量 
// _c('div',{id:app},_c("p",undefined,_v('hello'+_s(name))),_v('hello'))
function generate(el) {
    let children=genChildren(el)
    let code = 
    `_c(${JSON.stringify(el.tag)},${
        el.attrs.length > 0 ? genProps(el.attrs) : 'undefined'
    }${
        children?`,${children}`:''
    })`
    return code

}

// 生成render 函数
export function compilerToFunction(template) {
    // 1、 解析html字符串 html字符串->AST 语法树
    let ast = parseHTML(template)
    // 2、 AST语法树 -> render 函数生成vDom
    const code = generate(ast)
   // 3 所有得模板引擎实现 都需要加 new function+with    具体代码如下
//     function(){
//         with(this){
//             return code
//         }
//    }
     let render= new Function(`with(this){return ${code}}`)
     return render
}
/* <div id='#app'>
     <p> hello</p>
</div>
nodetype:1:阶段 3:元素

AST树：
let root={
    tag:'div',
    attr:[name:'id',value:'#app'],
    parent:null,
    type:1,
    children:[
        tag:'p',
        attr:[],
        parent:root,
        type:1,
        children:[
            text:'hello',
            type:3
        ]
    ]
} */

// render 函数 <div id='app'><p>hello {{name}}</p><p>hello</p></div>
//_c：节点  _v：文本 _s:变量 
// _c('div',{id:app},_c("p",undefined,_v('hello'+_s(name))),_v('hello'))
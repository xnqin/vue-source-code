(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function isDef (v) {
      return v !== undefined && v !== null
    }

    function isObject (obj) {
      return obj !== null && typeof obj === 'object'
    }
    function def(data,key,value){
      Object.defineProperty(data,key,{
        enumerable:false,
        configurable:false,
        value:value
    });
    }

    function proxy(vm,source,key){
      Object.defineProperty(vm,key,{
          get(){
              return vm[source][key]
          },set(newval){
              vm[source][key]=newval;
          }
      });
  }
  function query(el){
    if(typeof el ==='string'){
      const selected=document.querySelector(el);
      if(!selected){
        return document.createElement('div')
      }else {
        return selected
      }
    }else {
      return el;
    }
  }

  const arrayProto = Array.prototype;
  // value._proto_=arrayMethods
  // arrayMethods._proto_=arrayProto
  // 原型链查找
  //  装饰设计模型
  const arrayMethods = Object.create(arrayProto);
  const methodsToPatch = [
      'push',
      'pop',
      'shift',
      'unshift',
      'splice',
      'sort',
      'reverse'
  ];
  methodsToPatch.forEach(method => {
      arrayMethods[method] = function (...args) {
          // AOP 切片操作
          const result = arrayProto[method].call(this, ...args);
          // push unshift  后、前添加 添加的对象可能还是一个对象
          let inserted;
          const ob=this.__ob__;
          // 对于数组新增的值 要进行监听
          switch (method) {
              case 'push':
              case 'unshift':
                  inserted = args;
                  break;
              case 'splice':
                  inserted = args.slice(2);
                  break;
          }
          if(inserted){
              ob.observeArray(inserted);
             
          }


      };
  });

  class Dep{
      constructor() {
         this.deps=[];
          
      }
      addDep(dep){
          this.deps.push(dep);
      }
      notify(){
          this.deps.forEach(dep=>{
              dep.update();
          });
      }
      
  }

  // 响应式原理核心
  function observe(data){
      if(!isObject(data))return
      let obj=new Observer(data);
  }
  class Observer{
      constructor(value){
           def(value,'__ob__',this);
          // 对数组并不会对索引拦截,这样有损失性能，需要对数组里面的内容做拦截
          if(Array.isArray(value)){
              // 1、对数组里面的每一项 进行劫持
              // 2、对数组里面的方法 push shift unshift 劫持
              value.__proto__=arrayMethods;
              this.observeArray(value);
              

          }else {
              this.walk(value);
          }

      }
      observeArray(value){
          value.forEach(item=>{
              observe(item);
          });

      }
      walk(obj){
          let keys=Object.keys(obj);
          keys.forEach(key=>{
              defineReactive(obj,key,obj[key]);
          });   
      }
  }


  function defineReactive(obj,key,value){
      const property = Object.getOwnPropertyDescriptor(obj, key);
      if (property && property.configurable === false) {
        return
      }
      observe(value);
      const dep = new Dep();
      Object.defineProperty(obj,key,{
          enumerable:true,
          configurable:true,
          get(){
              Dep.target  && dep.addDep(Dep.target); 
              return value
          },
          set(newVal){
              if(newVal===value)return
              value=newVal;
              dep.notify();  
              observe(value);
   
          }
      });
  }

  function initState(vm) {
      const opt = vm.$option;
      if (opt.props)  initProps(vm,vm.props);
      if(opt.methods) initMethods(vm,vm.methods);
      if(opt.data) initData(vm);
      if(opt.computed) initComputed(vm,opt.computed);
      if(opt.watch) initWatch(vm,opt.watch);

  }

  function initProps(vm,propsOptions){

  }
  function initMethods(vm,methods){
      
  }

  function initData(vm){
      let data=vm.$option.data;
      // vm.name =>vm._data.name
      data=vm._data= typeof data ==='function'
      ?data.call(vm)
      :data || {};
      for(let key in data){
          proxy(vm,'_data',key);
      }
      observe(data);
      
  }
  function initComputed(vm,computed){
      
  }
  function initWatch(vm,watch){
      
  }

  //  AST语法树  用对象来描述html语法   虚拟dom：用对象来描述dom节点
  //  创建语法树 Convert HTML string to AST.
  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性id=  "dd" id=  'sss' id=  dd
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // abc-abc
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`;  //?:匹配不捕获<aaa:bb>
  const startTagOpen = new RegExp(`^<${qnameCapture}`); //匹配标签开头
  const startTagClose = /^\s*(\/?)>/;   //匹配/
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);  //匹配标签结束 </div>
  // const defaultTagRE=/\{\{\((?:.|\r?\n)+?)}\}/g

  let root = null; // AST 树根
  let currentParent; // 当前父节点
  let stack = []; // 栈
  let ELEMENT_TYPE = 1; //节点nodetype
  let TEXT_TYPE = 3; //文本节点 nodetype
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
      let element = createASTElement(start.tagName, start.attrs, currentParent);
      if (!root) {
          root = element;
      }
      currentParent = element;
      stack.push(element);
  }
  function end(end) {
      let element = stack.pop();
      if (element.tag === end) {
          currentParent = stack[stack.length - 1];
          if (currentParent) {
              element.parent = currentParent;
              currentParent.children.push(element);
          }
      }
  }
  function char(text) {
      text = text.trim();
      if (text) {
          currentParent.children.push({
              text,
              type: TEXT_TYPE
          });
      }
  }

  // html -> 对象格式
  function parseHTML(html) {
      while (html) {
          let textEnd = html.indexOf('<');
          // 有可能是开始标签 也有可能是结束标签
          if (textEnd == 0) {
              let startTagMatch = parseStartTag();
              if (startTagMatch) {
                  start(startTagMatch);
                  continue
              }
              const endTgMatch = html.match(endTag);
              if (endTgMatch) {
                  advince(endTgMatch[0].length);
                  end(endTgMatch[1]);
                  continue
              }
          }
          //文本 或者多个空格 
          let text;
          if (textEnd >= 0) {
             text = html.substring(0,textEnd);
          }
          if (text) {
              char(text);
              advince(text.length);
             
          }
      }
      return root
      function parseStartTag() {
          let start = html.match(startTagOpen);
          if (start) {
              advince(start[0].length);
              let match = {
                  tagName: start[1],
                  attrs: []
              };
              let end, attrs;
              while (!(end = html.match(startTagClose)) && (attrs = html.match(attribute))) {
                  advince(attrs[0].length);
                  match.attrs.push({
                      name: attrs[1],
                      value: attrs[3] || attrs[4] || attrs[5]
                  });
              }
              advince(end[0].length);
              return match;
          }

      }
      function advince(n) {
          html = html.substring(n);
      }
  }

  const tagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function genProps(props) {
      let staticProps = ``;
      for (let i = 0; i < props.length; i++) {
          const prop = props[i];
          // style="color:red;fontSize:'14px'" -> {style:{color:red;fontsize:14px}}
          if (prop.name === 'style') {
              let obj = {};
              prop.value.split(';').forEach(item => {
                  let [key, value ] = item.split(':');
                  obj[key] = value;
              });
              prop.value = obj;
          }
          staticProps += `${prop.name}:${JSON.stringify(prop.value)},`;
      }    return `{${staticProps.slice(0, -1)}}`
  }

  function genChildren(el){
      let children=el.children;
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
      let lastIndex=tagRE.lastIndex=0;
      while(match=tagRE.exec(text)){
          index = match.index;
          //console.log(match.index,'match.index==')
          if (index > lastIndex) {
              tokens.push(JSON.stringify(text.slice(lastIndex,index)));
          }
          tokens.push(`_s(${match[1].trim()})`);
          lastIndex=index+match[0].length;
          //console.log(lastIndex,'lastIndex')
      }
      if(lastIndex < text.length){
          tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      return `_v(${tokens.join('+')})`
  }
  // render 函数 <div id='app'><p>hello {{name}}</p><p>hello</p></div>
  //_c：节点  _v：文本 _s:变量 
  // _c('div',{id:app},_c("p",undefined,_v('hello'+_s(name))),_v('hello'))
  function generate(el) {
      let children=genChildren(el);
      let code = 
      `_c(${JSON.stringify(el.tag)},${
        el.attrs.length > 0 ? genProps(el.attrs) : 'undefined'
    }${
        children?`,${children}`:''
    })`;
      return code

  }

  // 生成render 函数
  function compilerToFunction(template) {
      // 1、 解析html字符串 html字符串->AST 语法树
      let ast = parseHTML(template);
      // 2、 AST语法树 -> render 函数生成vDom
      const code = generate(ast);
     // 3 所有得模板引擎实现 都需要加 new function+with    具体代码如下
  //     function(){
  //         with(this){
  //             return code
  //         }
  //    }
       let render= new Function(`with(this){return ${code}}`);
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

  class VNode{
      constructor(tag,data,children,key,text) {
          this.tag=tag;
          this.data=data;
          this.children=children;
          this.text=text;     
          this.key=key; 
      }
  }
  function createTextNode(text){
      return new VNode(undefined,undefined,undefined,undefined,String(text))
  }

  function createElement(tag,data={},...children){
      return new VNode(tag,data,children,undefined,undefined)

  }

  // html->AST语法树 正则表达式 ->render 字符串拼接 ->执行render函数，生成vnode->渲染真实得dom

  function renderMixin(Vue){
      Vue.prototype._c=function(){
        return  createElement(...arguments)
      };
      Vue.prototype._v=function(text){
        return createTextNode(text)
      };
      Vue.prototype._s=function(value){
          return typeof value==='object'?JSON.stringify(value):value
      };
      // 渲染出虚拟dom
      Vue.prototype._render=function(){
          const vm=this;
          const {render} =vm.$option;
          const vnode=render.call(vm,vm);  
          return vnode
      };

  }

  class Watcher{
      constructor(vm,exprOrFn,callback,options){
          this.vm=vm;
          this.exprOrFn=exprOrFn;
          this.callback=callback;
          Dep.target=this;
          this.options=options;
          if (typeof exprOrFn === 'function') {
              this.getter=exprOrFn;
          }     
          this.get();    
      }
      get(){
         return  this.getter.call(this.vm)
      }
      update(){
          console.log('数据改变了');
          this.get();
      }
  }

  function patch(oldVnode, vnode) {
      const isRealElement = oldVnode.nodeType;
      // 任何节点相同
      if (!isRealElement && sameVnode(oldVnode, vnode)) {
          // Diff 算法
          patchVnode(oldVnode, vnode);
      } else {
          // 第一次 渲染 一定走这步
          if (isRealElement) {
              const oldElm = oldVnode;
              const parentElm = oldElm.parentNode;
              createElm(vnode);
              parentElm.insertBefore(vnode.elm, oldElm.nextSibling);
              parentElm.removeChild(oldElm);  // 替换        
          }
          return vnode.elm
      }

  }
  function patchVnode(oldVnode, vnode) {
      if (oldVnode === vnode) return
      const elm = vnode.elm = oldVnode.elm;
      const data = vnode.data;
      const oldCh = oldVnode.children;
      const ch = vnode.children;
      // 是个节点
      if (!isDef(vnode.text)) {
          if (isDef(oldCh) && isDef(ch)) {
              // 核心代码
              if (oldCh !== ch) {
                  updateChildren(elm, oldCh, ch);
              }
          } else if (isDef(ch)) {
              if (!isDef(oldVnode.text)) elm.textContent = '';
              addVnodes(elm, ch, 0, ch.lenght - 1);
          } else if (isDef(oldCh)) {
              removeVnodes(elm, oldCh);
          } else if (isDef(oldVnode.text)) elm.textContent = '';
      } else if (vnode.text !== oldVnode.text) {
          elm.textContent = vnode.text;
      }
  }
  function updateChildren(parentElm, oldCh, newCh) {
      let oldStartIdx = 0;
      let oldEndIdx = oldCh.length - 1;

      let newStartIdx = 0;
      let newEndIdx = newCh.length - 1;

      let oldStartVnode = oldCh[0];
      let oldEndVnode = oldCh[oldEndIdx];

      let newStartVnode = newCh[0];
      let newEndVnode = newC[newEndIdx];

      let oldKeyToIdx, idxInOld, vnodeToMove;
      while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
          if (!isDef(oldStartVnode)) {
              oldStartVnode = oldCh[++oldStartIdx];
          } else if (!isDef(oldEndVnode)) {
              oldEndVnode = oldCh[--oldEndVnode];
          } else if (sameVnode(oldStartVnode, newStartVnode)) {
              patchVnode(oldStartVnode, newStartVnode);
              oldStartVnode = oldCh[++oldStartIdx];
              newStartVnode = newCh[++newStartIdx];
          } else if (sameVnode(oldStartVnode, newEndVnode)) {
              patchVnode(oldStartVnode, newStartVnode);
              parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling);
              oldStartVnode = oldCh[++oldStartIdx];
              newEndVnode = newCh[--newEndIdx];

          } else if (sameVnode(oldEndVnode, newStartVnode)) {
              patchVnode(oldEndVnode, newStartVnode);
              parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm);
              oldEndVnode = oldCh[--oldEndIdx];
              newStartVnode = newCh[++newStartIdx];

          } else if (sameVnode(oldEndVnode, newEndVnode)) {
              patchVnode(oldStartVnode, newStartVnode);
              oldStartVnode = oldCh[--oldEndIdx];
              newStartVnode = newCh[--newEndIdx];
          } else {
              // let oldKeyToIdx, idxInOld, vnodeToMove;
              if (!isDef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
              idxInOld = newStartIdx.key ? oldKeyToIdx[newStartIdx.key] : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
              if(isDef(idxInOld)){
                  vnodeToMove=oldCh[idxInOld];
                  if(sameVnode(vnodeToMove,newStartVnode)){
                      patchVnode(vnodeToMove,newStartVnode);
                      parentElm.insertBefore(newStartVnode.elm,oldStartVnode.elm);
                  }else {
                      createElm(newStartVnode);
                  }
              }else {
                  createElm(newStartVnode);
              }
          }
      }
      // 旧的节点 先遍历完的 新增新的节点
      if(oldStartIdx>oldEndIdx){
          addVnodes(parentElm, newCh, newStartIdx,newEndIdx);   
      // 新的节点先遍历完的,删除旧的节点
      }else if(newStartIdx>newEndIdx){
          removeVnodes(parentElm,oldCh,oldStartIdx,oldEndIdx);
      }
  }
  function findIdxInOld(node, oldCh, start, end) {
      for (let i = start; i < end; i++) {
          let c = oldCh[i];
          if (isDef(c) && sameVnode(c, node))
              return i
      }

  }
  function createKeyToOldIdx(children, startIdx, endIdx) {
      const map = {};
      let i;
      for (i = startIdx; i < endIdx; i++) {
          key = children[i].key;
          if (isDef(key)) map[key] = i;
      }
      return map

  }
  function addVnodes(parentElm, vnode, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
          parentElm.appendChild(createElm(vnode[startIdx]));
      }
  }
  function removeVnodes(parentElm, vnode, startIdx, endIdx) {
      for (; startIdx <= endIdx; ++startIdx) {
          const ch = vnode[startIdx];
          if (isDef(ch)) {
              parentElm.removeChild(ch.elm);
          }
          //parentElm.appendChild(createElm(vnode[startIdx]))
      }
  }
  function sameVnode(a, b) {
      console.log(a, 'a==');
      console.log(b, 'b==');
      return a.tag === b.tag && isDef(a.data) && isDef(b.data) && sameInputType(a, b)
  }
  //  <input 的内容 type
  function sameInputType(a, b) {
      if (!a.tag !== 'input') return true;
      let i;
      const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
      const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
      // 源码还有判断 是否有input 类型
      return typeA === typeB
  }

  function createElm(vnode) {
      let { tag, data, children, text } = vnode;
      if (typeof tag === 'string') {
          vnode.elm = document.createElement(tag);
          updataProperties(vnode);
          if (children) {
              createChildren(vnode, children);
          }
      }
      else {
          vnode.elm = createTextNode$1(text);
      }
      return vnode.elm
  }
  function updataProperties(vnode) {
      let newProps = vnode.data;
      if (newProps) {
          let elm = vnode.elm;
          for (let key in newProps) {
              if (key === 'style') {
                  for (let styleName in newProps[key]) {
                      elm.style[styleName] = newProps[key][styleName];
                  }

              } else if (key === 'class') {
                  el.className = newProps[key];

              } else {
                  elm.setAttribute(key, newProps[key]);
              }

          }
      }
  }
  function createTextNode$1(text) {
      return document.createTextNode(text);
  }
  function createChildren(vnode, children) {
      if (Array.isArray(children)) {
          children.forEach(child => {
              vnode.elm.appendChild(createElm(child));
          });
      }
  }

  function lifecycleMixin (Vue) {
      // 通过虚拟dom 创建真实的dom
      Vue.prototype._update=function(vnode){
          const vm=this;
          vm.$el=patch(vm.$el,vnode);
      };

  }
  function mountComponent(vm,el){
      const option=vm.$option;
      vm.$el=el;
      let updateComponent = () => {
          vm._update(vm._render());
        };
      // watcher.js文件中 渲染页面
      new Watcher(vm,updateComponent,()=>{},{});
      return vm

  }

  // 初始化核心
  function initMixin(Vue) {
      Vue.prototype._init = function (option) {
          const vm = this;
          vm.$option = option;
          initState(vm);

          // 挂载流程
          if (vm.$option.el) {
              vm.$mount(vm.$option.el);
          }
      };
      Vue.prototype.$mount = function (el) {
          const vm = this;
          if (!vm.$option.render) {
              let template = vm.$option.template;
              if(template){
                  if (template.charAt(0) === '#') {
                      template=document.querySelector(template).innerHTML;
                   }else if(template.nodeType){
                       template=tempate.innerHTML;
                   }
              }
              else {
                  template = document.querySelector(el).outerHTML;  // 有兼容性问题 需要再包一层div 去innerHTML
              }
              const render = compilerToFunction(template);
              vm.$option.render = render;
              el = query(el);
              // 挂载组件
              mountComponent(this,el);
          }
      };
  }

  // Vue 核心代码
  function Vue(option){
     this._init(option);
    
  }
  initMixin(Vue);
  lifecycleMixin(Vue);
  renderMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map

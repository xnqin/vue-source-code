import {createElement} from '../vdom/create-element'
import {createTextNode} from '../vdom/vnode'
export function initRender(vm){
  
}
export function renderMixin(Vue){
    Vue.prototype._c=function(){
      return  createElement(...arguments)
    }
    Vue.prototype._v=function(text){
      return createTextNode(text)
    }
    Vue.prototype._s=function(value){
        return typeof value==='object'?JSON.stringify(value):value
    }
    // 渲染出虚拟dom
    Vue.prototype._render=function(){
        const vm=this
        const {render} =vm.$option
        const vnode=render.call(vm,vm)  
        return vnode
    }

}
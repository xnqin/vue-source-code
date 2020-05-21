import Watcher from '../observer/watcher'
import {patch} from '../vdom/patch'
export function lifecycleMixin (Vue) {
    // 通过虚拟dom 创建真实的dom
    Vue.prototype._update=function(vnode){
        const vm=this;
        vm.$el=patch(vm.$el,vnode)
    }

}
export function mountComponent(vm,el){
    const option=vm.$option
    vm.$el=el
    let updateComponent = () => {
        vm._update(vm._render())
      }
    // watcher.js文件中 渲染页面
    new Watcher(vm,updateComponent,()=>{},{})
    return vm

}
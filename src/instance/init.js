// 初始化核心
import { initState } from './state'
import { compilerToFunction } from '../compiler/index.js'
import {initRender} from './render'
import {mountComponent} from './lifecycle'
import {query} from '../util/index'
export function initMixin(Vue) {
    Vue.prototype._init = function (option) {
        const vm = this
        vm.$option = option
        initState(vm)
        initRender(vm)

        // 挂载流程
        if (vm.$option.el) {
            vm.$mount(vm.$option.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this;
        if (!vm.$option.render) {
            let template = vm.$option.template
            if(template){
                if (template.charAt(0) === '#') {
                    template=document.querySelector(template).innerHTML
                 }else if(template.nodeType){
                     template=tempate.innerHTML
                 }
            }
            else {
                template = document.querySelector(el).outerHTML  // 有兼容性问题 需要再包一层div 去innerHTML
            }
            const render = compilerToFunction(template)
            vm.$option.render = render
            el = query(el)
            // 挂载组件
            mountComponent(this,el)
        }
    }
}
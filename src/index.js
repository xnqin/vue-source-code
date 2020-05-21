// Vue 核心代码
import {initMixin} from './instance/init'
import {lifecycleMixin} from './instance/lifecycle'
import {renderMixin} from './instance/render'
function Vue(option){
   this._init(option)
  
}
initMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
export default Vue
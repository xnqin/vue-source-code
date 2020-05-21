// 响应式原理核心
import {isObject,def} from '../util/index'
import {arrayMethods}  from './array'
import Dep from './dep'
export function observe(data){
    if(!isObject(data))return
    let obj=new Observer(data)
}
export class Observer{
    constructor(value){
         def(value,'__ob__',this)
        // 对数组并不会对索引拦截,这样有损失性能，需要对数组里面的内容做拦截
        if(Array.isArray(value)){
            // 1、对数组里面的每一项 进行劫持
            // 2、对数组里面的方法 push shift unshift 劫持
            value.__proto__=arrayMethods
            this.observeArray(value)
            

        }else {
            this.walk(value)
        }

    }
    observeArray(value){
        value.forEach(item=>{
            observe(item)
        })

    }
    walk(obj){
        let keys=Object.keys(obj)
        keys.forEach(key=>{
            defineReactive(obj,key,obj[key])
        })   
    }
}


export function defineReactive(obj,key,value){
    const property = Object.getOwnPropertyDescriptor(obj, key)
    if (property && property.configurable === false) {
      return
    }
    observe(value)
    const dep = new Dep()
    Object.defineProperty(obj,key,{
        enumerable:true,
        configurable:true,
        get(){
            Dep.target  && dep.addDep(Dep.target); 
            return value
        },
        set(newVal){
            if(newVal===value)return
            value=newVal
            dep.notify()  
            observe(value)
 
        }
    })
}

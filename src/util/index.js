export function isDef (v) {
    return v !== undefined && v !== null
  }

  export function isObject (obj) {
    return obj !== null && typeof obj === 'object'
  }

  const _toString = Object.prototype.toString
  
  export function isPlainObject (obj) {
    return _toString.call(obj) === '[object Object]'
  }
  export function def(data,key,value){
    Object.defineProperty(data,key,{
      enumerable:false,
      configurable:false,
      value:value
  })
  }

  export function proxy(vm,source,key){
    Object.defineProperty(vm,key,{
        get(){
            return vm[source][key]
        },set(newval){
            vm[source][key]=newval
        }
    })
}
export function query(el){
  if(typeof el ==='string'){
    const selected=document.querySelector(el)
    if(!selected){
      return document.createElement('div')
    }else {
      return selected
    }
  }else {
    return el;
  }
}
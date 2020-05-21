import Dep from './dep'
export default class Watcher{
    constructor(vm,exprOrFn,callback,options){
        this.vm=vm;
        this.exprOrFn=exprOrFn;
        this.callback=callback;
        Dep.target=this
        this.options=options
        if (typeof exprOrFn === 'function') {
            this.getter=exprOrFn
        }     
        this.get()    
    }
    get(){
       return  this.getter.call(this.vm)
    }
    update(){
        console.log('数据改变了')
        this.get()
    }
}
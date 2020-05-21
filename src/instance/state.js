import {observe} from '../observer/index'
import {proxy} from '../util/index'
export function initState(vm) {
    const opt = vm.$option;
    if (opt.props)  initProps(vm,vm.props);
    if(opt.methods) initMethods(vm,vm.methods)
    if(opt.data) initData(vm)
    if(opt.computed) initComputed(vm,opt.computed)
    if(opt.watch) initWatch(vm,opt.watch)

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
    :data || {}
    for(let key in data){
        proxy(vm,'_data',key)
    }
    observe(data);
    
}
function initComputed(vm,computed){
    
}
function initWatch(vm,watch){
    
}
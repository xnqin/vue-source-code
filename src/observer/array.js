const arrayProto = Array.prototype
// value._proto_=arrayMethods
// arrayMethods._proto_=arrayProto
// 原型链查找
//  装饰设计模型
export const arrayMethods = Object.create(arrayProto)
const methodsToPatch = [
    'push',
    'pop',
    'shift',
    'unshift',
    'splice',
    'sort',
    'reverse'
]
methodsToPatch.forEach(method => {
    arrayMethods[method] = function (...args) {
        // AOP 切片操作
        const result = arrayProto[method].call(this, ...args)
        // push unshift  后、前添加 添加的对象可能还是一个对象
        let inserted
        const ob=this.__ob__
        // 对于数组新增的值 要进行监听
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2)
                break;
        }
        if(inserted){
            ob.observeArray(inserted)
           
        }


    }
})
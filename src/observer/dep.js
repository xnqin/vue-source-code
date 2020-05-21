export default class Dep{
    constructor() {
       this.deps=[]
        
    }
    addDep(dep){
        this.deps.push(dep)
    }
    notify(){
        this.deps.forEach(dep=>{
            dep.update()
        })
    }
    
}

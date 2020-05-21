export default  class VNode{
    constructor(tag,data,children,key,text) {
        this.tag=tag
        this.data=data
        this.children=children
        this.text=text     
        this.key=key 
    }
}
export function createTextNode(text){
    return new VNode(undefined,undefined,undefined,undefined,String(text))
}


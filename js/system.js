import { globalSelect } from "./globalSelect.js";
import { checkedTree } from "./tree.js";

const SYMBOLS = {
    open: "&#8744;",
    close: "&#62;",
    task: "&#8739;",
};

function changeSelected(obj, select) {
    select[1] = select[0];
    select[0] = obj;
}

function changeExclude(obj) {
    if(obj != "/"){
        changeSelected(obj, globalSelect.selectedExclude)
    }
}

class BaseElement {
    constructor(daddy, name, type, construct = true) {
        this.name = name;
        this.daddy = daddy;
        this.type = type;

        construct ? this.create() : null;
    }

    create() {

        const createElement = (type, classes = [], attributes = {}) => {
            const element = document.createElement(type)
            classes.forEach(cls => element.classList.add(cls))
            Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
            return element;
        }
    
        const appendChildren = (parent, children) => {
            children.forEach(child => parent.appendChild(child))
        }
    
        const toggleFolder = (event) => {
            event.stopPropagation()
            changeSelected(this.path, globalSelect.selected)
            changeExclude({path: this.daddy.path, name: this.name})
            this.open = !this.open;
            this.element.style.display = this.open ? "block" : "none"
            this.elementChildren[0].innerHTML = this.open ? `${SYMBOLS.open} ` : `${SYMBOLS.close} `
        }


        
    
        if (this.type === "folder") {
            this.button = createElement("button", ["folder", "folderButton"])
            this.elementChildren = [createElement("span"), createElement("span")]
            this.elementChildren2 = [createElement("span"), createElement("span")]
            this.elementChildren[0].innerHTML = `${SYMBOLS.open} `
            this.elementChildren[1].textContent = `${this.name}`
            this.elementChildren2[0].textContent = `100%`
            this.elementChildren2[0].style.marginLeft = `5px`
            this.elementChildren2[1].textContent = `0 / 0`
            this.elementChildren2[1].style.marginLeft = `20px`
            this.percentDiv = document.createElement('div')
            this.percentDiv.classList.add("percent")
            this.percentChildrenDiv = document.createElement('div')
            this.percentChildrenDiv.classList.add("percentChildren")

            appendChildren(this.button, this.elementChildren)
            this.percentDiv.appendChild(this.percentChildrenDiv)
            this.button.appendChild(this.percentDiv)
            appendChildren(this.button, this.elementChildren2)

    
            this.element = createElement("div", ["folder"])
            appendChildren(this.daddy.element, [this.button, this.element])
    
            this.button.addEventListener("click", toggleFolder)
            this.element.addEventListener("click", (event) => {
                event.stopPropagation();
                changeSelected(this.path, globalSelect.selected)
                changeExclude({path: this.daddy.path, name: this.name})
            })
        } else if (this.type === "task") {
            this.element = createElement("div", ["task"]);
            this.elementChildren = [
                createElement("label", [], { 'for': this.name}),
                [createElement("span", [], {}), createElement("span", [], {})],
                createElement("input", ["checkbox"], { type: 'checkbox', name: this.name })
            ];
            this.elementChildren[1][0].innerHTML = `${SYMBOLS.task}` 
            this.elementChildren[1][1].textContent = `${this.name}`

            appendChildren(this.elementChildren[0], this.elementChildren[1]);
            appendChildren(this.element, [this.elementChildren[0], this.elementChildren[2]]);
            this.daddy.element.appendChild(this.element);

            this.element.addEventListener('click', (event) => {
                event.stopPropagation()
                changeExclude({path: this.daddy.path, name: this.name})
            })
    
            this.elementChildren[2].addEventListener('change', () => {
                this.element.classList.toggle('mark', this.elementChildren[2].checked)
                checkedTree(this.daddy.path, this.name, this.elementChildren[2].checked)

                let elements = [[], []];
                Object.values(this.daddy.children).forEach(e => {
                    if (e.type == 'task') {
                        if (e.elementChildren[2].checked) {
                            elements[1].push(e.element)
                        } else {
                            elements[0].push(e.element)
                        }
                    } else {
                        elements[0].push(e.button)
                        elements[0].push(e.element)
                    }
                });    

                for (let i = 0; i < elements[0].length; i++) {
                    this.daddy.element.appendChild(elements[0][i])
                }

                this.daddy.percentAtt(this.daddy)
                
                for (let i = 0; i < elements[1].length; i++) {
                    this.daddy.element.appendChild(elements[1][i])
                }
            })
            
        } else {
            console.error("Tipo desconhecido:", this.type);
        }           
    }
}

class Folder extends BaseElement {
    constructor(path, daddy, name, construct) {
        super(daddy, name, "folder", construct);
        this.children = {};
        this.open = true;
        this.path = name != 'root' ? path == '/' ? `/${name}` : path + `/${name}` : '/'
        this.complete = true
    }

    addChildren(name, type) {
        if (!this.children[name]) {
            switch (type) {
                case "folder":
                    this.children[name] = new Folder(this.path, this, name);
                    break;
                case "task":
                    this.children[name] = new Task(this.path, this, name);
                    break;
                default:
                    alert(`O tipo '${type}' é desconhecido`);
            }
            
            this.percentAtt(this)
            
        } else {
            alert(`O ${type} '${name}' já existe.`);
        }
    }

    percentAtt(obj) {
        if(obj.name != "root"){
            let children = Object.values(obj.children)
            let childrenTotal = children.length
            let childrenCompleted = children.filter( e => e.type == 'task').filter(e => e.elementChildren[2].checked).length + children.filter( e => e.type == 'folder').filter(e => e.complete).length
            let Percent = Math.round((childrenCompleted * 100) / childrenTotal) ? Math.round((childrenCompleted * 100) / childrenTotal) : 0

            obj.percentChildrenDiv.style.width = `${Percent}%`
            if(Percent == 100){
                obj.complete = true
            }else{
                obj.complete = false
            }

            this.elementChildren2[0].textContent = `${Percent}%`
            this.elementChildren2[1].textContent = `${childrenCompleted} / ${childrenTotal}`

            obj.daddy.percentAtt(obj.daddy)
        }
    }

    remove(name) {

            switch(this.children[name].type){
                case 'folder':
                    this.element.removeChild(this.children[name].button)
                    this.element.removeChild(this.children[name].element)
                break;
                case 'task':
                    this.element.removeChild(this.children[name].element)
                break;
                default:
                    alert(`'${name}' não existe.`)
                break;
            }

            delete this.children[name];
            changeSelected(this.path, globalSelect.selected)
            this.percentAtt(this)

            
    }

    search(name) {
        return this.children[name] || null;
    }

}

class Task extends BaseElement {
    constructor(path, daddy, name, construct = true) {
        super(daddy, name, "task", construct);
    }

    checked(checked){
        if(checked){
            this.elementChildren[2].checked = true;
        
            const event = new Event('change', {
              bubbles: true,
              cancelable: true
            });
        
            this.elementChildren[2].dispatchEvent(event);
        }
    }
}

class FileSystem {
    constructor() {
        this.root = new Folder('/', null, "root", false);
        this.root.element = document.getElementById("main");
        this.path = '/'
    }

    addChildren(path, name, type) {
        const folder = this.navigateTo(path);
        if (folder) {
            if (folder.type === "folder") {
                folder.addChildren(name, type);
            } else {
                alert("Isso não é uma pasta");
            }
        } else {
            alert(`O caminho '${path}' não existe.`);
        }
    }

    remove(path, name) {
        const folder = this.navigateTo(path);
        if (folder) {
            if (folder.type === "folder") {
                folder.remove(name);
            } else {
                alert("Isso não é uma pasta");
            }
        } else {
            alert(`O caminho '${path}' não existe.`);
        }
    }

    search(path, name) {
        const folder = this.navigateTo(path);
        if (folder) {
            return folder.search(name);
        } else {
            alert(`O caminho '${path}' não existe.`);
            return null;
        }
    }

    navigateTo(path) {
        const parts = path.split("/");
        let current = this.root;
        for (let part of parts) {
            if (part && current.children[part]) {
                current = current.children[part];
            } else if (part) {
                return null;
            }
        }
        return current;
    }
}

export var system = new FileSystem();
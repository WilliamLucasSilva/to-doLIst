const SYMBOLS = {
    open: "&#8744;",
    close: "&#62;",
    task: "&#8739;",
};

const SHARE = {
    NAME: document.getElementById("inputName"),
    TYPE: document.getElementById("toDo").checked ? "task" : "folder",
};

var selectedExclude = [null, null]
var selected = ['/', '/']

// Classes

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
            changeSelected(this.path, selected)
            changeExclude({path: this.daddy.path, name: this.name})
            this.open = !this.open;
            this.element.style.display = this.open ? "block" : "none"
            this.elementChildren[0].innerHTML = this.open ? `${SYMBOLS.open} ` : `${SYMBOLS.close} `
        }
    
        if (this.type === "folder") {
            this.button = createElement("button", ["folder", "folderButton"])
            this.elementChildren = [createElement("span"), createElement("span")]
            this.elementChildren[0].innerHTML = `${SYMBOLS.open} `
            this.elementChildren[1].textContent = `${this.name}`
            this.percentDiv = document.createElement('div')
            this.percentDiv.classList.add("percent")
            this.percentChildrenDiv = document.createElement('div')
            this.percentChildrenDiv.classList.add("percentChildren")

            appendChildren(this.button, this.elementChildren)
            this.percentDiv.appendChild(this.percentChildrenDiv)
            this.button.appendChild(this.percentDiv)

    
            this.element = createElement("div", ["folder"])
            appendChildren(this.daddy.element, [this.button, this.element])
    
            this.button.addEventListener("click", toggleFolder)
            this.element.addEventListener("click", (event) => {
                event.stopPropagation();
                changeSelected(this.path, selected)
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

                let tasks = Object.values(this.daddy.children).filter((e) => e.type == 'task')
                let TaskTotal = tasks.length
                let TaskCompleted = elements[1].length
                let Percent = (TaskCompleted * 100) / TaskTotal

                this.daddy.percentChildrenDiv.style.width = `${Percent}%`

                
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
        } else {
            alert(`O ${type} '${name}' já existe.`);
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
            changeSelected(this.path, selected)

            
    }

    search(name) {
        return this.children[name] || null;
    }

}

class Task extends BaseElement {
    constructor(path, daddy, name, construct = true) {
        super(daddy, name, "task", construct);
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

var system = new FileSystem();

function changeSelected(obj, select) {
    select[1] = select[0];
    select[0] = obj;
}

function changeExclude(obj) {
    if(obj != "/"){
        changeSelected(obj, selectedExclude)
    }
}

document.getElementById("send").addEventListener("click", () => {
    SHARE.TYPE = document.getElementById("toDo").checked ? "task" : "folder";
    let NAME = SHARE.NAME.value;
    if (!NAME) {
        alert("Preencha o campo de texto!");
        return;
    }

    system.addChildren(selected[0], NAME, SHARE.TYPE);
});

document.getElementById("exclude").addEventListener("click", () => {
    if(selectedExclude[0] != null){
        system.remove(selectedExclude[0].path, selectedExclude[0].name)
    }
})

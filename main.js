const SYMBOLS = {
    open: "&#8744;",
    close: "&#62;",
    task: "&#8739;",
};

const MAIN = document.getElementById("main");

const SHARE = {
    NAME: document.getElementById("inputName"),
    TYPE: document.getElementById("toDo").checked ? "task" : "folder",
};

var selected = ['/','/']

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
            changeSelected(this.path)
            this.open = !this.open;
            this.element.style.display = this.open ? "block" : "none"
            this.elementChildren[0].innerHTML = this.open ? `${SYMBOLS.open} ` : `${SYMBOLS.close} `
        }
    
        if (this.type === "folder") {
            this.button = createElement("button", ["folder", "folderButton"])
            this.elementChildren = [createElement("span"), createElement("span")]
            this.elementChildren[0].innerHTML = `${SYMBOLS.open} `
            this.elementChildren[1].textContent = `${this.name}`
            appendChildren(this.button, this.elementChildren)
    
            this.element = createElement("div", ["folder"])
            appendChildren(this.daddy, [this.button, this.element])
    
            this.button.addEventListener("click", toggleFolder)
            this.element.addEventListener("click", (event) => {
                event.stopPropagation();
                changeSelected(this.path)
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
            this.daddy.appendChild(this.element);
    
            this.elementChildren[2].addEventListener('change', () => {
                this.element.classList.toggle('mark', this.elementChildren[2].checked)
                
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
                    this.children[name] = new Folder(this.path, this.element, name);
                    break;
                case "task":
                    this.children[name] = new Task(this.element, name);
                    break;
                default:
                    alert(`O tipo '${type}' é desconhecido`);
            }
        } else {
            alert(`O ${type} '${name}' já existe.`);
        }
    }

    remove(name) {
        if (this.children[name]) {
            delete this.children[name];
        } else {
            console.log(`'${name}' não existe.`);
        }
    }

    search(name) {
        return this.children[name] || null;
    }

}

class Task extends BaseElement {
    constructor(daddy, name, construct = true) {
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
            console.log(`O caminho '${path}' não existe.`);
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

function changeSelected(obj) {
    selected[1] = selected[0];
    selected[0] = obj;
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

import { globalSelect } from "./globalSelect.js";
import { checkedTree } from "./tree.js";

const SYMBOLS = {
    open: "&#8744;",
    close: "&#62;",
    task: "&#8739;",
};

const PRESETS = {
    folder: {
        type: 'div',
        children: [
            {
                type: 'div',
                classes: ['flexStart'],
                children: [ 
                    {
                        type: 'span',
                        children: []
                    },
                    {
                        type: 'form',
                        children: [
                            {
                                type: 'input',
                                children: [],
                            }
                        ],
                    },
                    {
                        type: 'div',
                        classes: ['flexStart'],
                        children: [
                            { type: 'span', content: '0/0', children: [] },
                            {
                                type: 'div',
                                classes: ['flexStart'],
                                children: [
                                    { type: 'div', classes: ['percent'], children: [
                                        {type: 'div', children: [], classes : ['percentChildren'] },
                                    ] },
                                    { type: 'span', content: '0%', children: [] },
                                ],
                            },
                        ],
                    },
                    { type: 'div', children: [] },
                ],
            },


            { type: 'div', children: [], classes: ['folder'], },
        ],
    },


    task: {
        type: 'label',
        classes: ['task', 'flexStart'],
        children: [
            { type: 'input[checkbox]', children: [], classes: ['checkbox'] },
            {
                type: 'form',
                children: [
                    { type: 'input', children: [] },
                ],
            },
        ],
    },
};

function createHtmlElement({ type, content = '', children = [], classes = [] }, parent = null) {
    let element;

    const typeMatch = type.match(/^(.*?)\[(.*?)\]$/);
    if (typeMatch) {
        const [, tag, attribute] = typeMatch;
        element = document.createElement(tag);
        element.type = attribute;
    } else {
        element = document.createElement(type);
    }

    if(classes.length){
        classes.forEach((c) => { element.classList.add(c) })
    }

    if (content) element.textContent = content;
    if (parent) parent.appendChild(element);

    const childElements = children.map((child) => createHtmlElement(child, element));

    return { type, element, children: childElements };
}

function changeSelected(obj, select) {
    [select[1], select[0]] = [select[0], obj];
}

class Model {
    constructor(daddy, name, type, path, construct = true) {
        //info
        this.name = name;
        this.daddy = daddy;
        this.type = type;
        this.path = !path ? '/' : this.type == 'folder' ? `${path}${name}/` : `${path}${name}`;

        this.open = true


        //create html elements
        if (construct) this.create(name);
    }

    create(name) {

        //creating html elements
        const preset = PRESETS[this.type];
        this.element = createHtmlElement(preset, this.daddy?.daddyElement);

        //name ----------------------------------------------------------------

            //variables
            this.nameElement = this.type == 'folder' ? this.element.children[0].children[1] : this.element.children[1]
            this.nameInput = this.nameElement.children[0].element

            //init
            this.nameInput.autocomplete = "off"
            this.nameInput.placeholder = name
            this.nameInput.classList.add('folderName')

            //events
            this.nameInput.addEventListener('blur', () => { this.nameInput.value = '' });
            
            this.nameElement.element.addEventListener('submit', (event) => {
                event.preventDefault();

                let newName = this.nameInput.value

                if(!newName){
                    this.nameInput.value = ''
                    return;
                }

                if(Object.keys(this.daddy.children).includes(newName)){
                    return;
                }
                
                this.pathAtt(newName);
                this.nameInput.placeholder = newName;
                this.name = newName;
                this.nameInput.value = '';
                delete this.daddy.children[this.name];
                this.daddy.children[this.name] = this;
            });
        //finish

        this.daddyElement = this.type == 'folder' ? this.element.children[1].element : null

        //styles --------------------------------------------------------------


        switch(this.type){
            case 'folder':
                //folder button

                //variables
                let folderButton = this.element.children[0];
                let percentDivTemp = folderButton.children[2]

                this.importantElement = {
                    itemsCont: percentDivTemp.children[0].element,
                    itemsPercent: percentDivTemp.children[1].children[1].element,
                    barPercent: percentDivTemp.children[1].children[0].children[0].element,
                }

                //open logic
                    folderButton.children[0].element.innerHTML = SYMBOLS['open']
                    folderButton.element.classList.add('folderButton')
                    
                    folderButton.element.addEventListener('click', (event) => {
                        event.stopPropagation();


                        changeSelected(this.path, globalSelect.select)

                        this.open = !this.open

                        console.log('click ', this.open)

                        if(this.open){
                            this.element.children[1].element.style.display = 'block'
                            folderButton.children[0].element.innerHTML = SYMBOLS['open']
                        }else{
                            this.element.children[1].element.style.display = 'none'
                            folderButton.children[0].element.innerHTML = SYMBOLS['close']
                        }
                    })
                //finish
            break
            case 'task':

                this.element.children[0].element.addEventListener('change', () => {
                    this.check = this.element.children[0].element.checked

                    this.daddy.updateCompletion()
                })
            break 
        }

    }

    pathAtt(name){
        this.path = this.type == 'folder' ? `${this.daddy.path}${name}/` : `${this.daddy.path}${name}`
    }
}

class Folder extends Model {
    constructor(daddy, name, path, construct) {
        super(daddy, name, "folder", path, construct);

        changeSelected(this.path, globalSelect.select);
        this.children = {};
        
        this.open = true;
        this.complete = true;
    }

    addChildren(name, type) {
        if (!this.children[name]) {
            this.children[name] = type === "folder"
                ? new Folder(this, name, this.path)
                : new Task(this, name, this.path);

            if(this.path != '/') this.updateCompletion();
        }
    }

    updateCompletion() {
        if(this.path == '/'){
            return;
        }

        //variables
        const children = Object.values(this.children);
        const total = children.length;
        const completed = children.filter(child =>
            (child.type === 'task' && child.check) ||
            (child.type === 'folder' && child.complete)
        ).length;

        const percent = total ? Math.round((completed / total) * 100) : 0;

        //att stats
        console.log(percent === 100)
        this.complete = percent === 100;
        this.importantElement.itemsPercent.textContent = `${percent}%`;
        this.importantElement.itemsCont.textContent = `${completed}/${total}`;
        this.importantElement.barPercent.style.width = `${percent}%`;

        if(percent >= 0 && percent <= 25){
            this.importantElement.barPercent.style.backgroundColor = 'red'
        }
        if(percent >= 26 && percent <= 50){
            this.importantElement.barPercent.style.backgroundColor = 'orange'
        }
        if(percent >= 51 && percent <= 75){
            this.importantElement.barPercent.style.backgroundColor = 'yellow'
        }
        if(percent >= 76 && percent <= 100){
            this.importantElement.barPercent.style.backgroundColor = 'green'
        }

        if(this.complete && total > 0){
            this.importantElement.barPercent.classList.add('bkAnimation')
        }else{
            this.importantElement.barPercent.classList.remove('bkAnimation')
        }

        if (this.daddy) this.daddy.updateCompletion();
    }

    remove(name) {
        const child = this.children[name];
        if (child) {
            this.element.removeChild(child.element.element);
            delete this.children[name];

            changeSelected(this.path, globalSelect.selected);
            this.updateCompletion();
        }
    }

    search(name) {
        return this.children[name] || null;
    }
}

class Task extends Model {
    constructor(daddy, name, path, construct = true) {
        super(daddy, name, "task", path, construct);

        this.check = false
    }

    checked(isChecked) {
        if (isChecked) {
            const checkbox = this.elementChildren[2];
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        }
    }
}

class FileSystem {
    constructor() {
        this.root = new Folder(null, "root", false, false);
        this.root.daddyElement = document.getElementById("todoList");
        this.path = '/';
    }

    addChildren(path, name, type) {
        const folder = this.navigateTo(path);
        if (folder?.type === "folder"){

            if(Object.keys(folder.children).includes(name)){
                return;
            }else{
                folder.addChildren(name, type);
            }
        } 
    }

    remove(path, name) {
        const folder = this.navigateTo(path);
        if (folder?.type === "folder") folder.remove(name);
    }

    search(path, name) {
        const folder = this.navigateTo(path);
        return folder ? folder.search(name) : alert(`O caminho '${path}' não existe.`) || null;
    }

    navigateTo(path) {
        return path.split("/").reduce((current, part) => (part && current?.children[part]) || current, this.root);
    }
}

export const system = new FileSystem();

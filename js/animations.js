export function getElements({name = '', type = ''}){
    function getName(name, type){
        let getAttribute = (name, type) => {
            return `[${type}="${name}"]`
        }
        let prefix = {
            tag: '',
            id: '#',
            class: '.',
        }

        return type in prefix ? prefix[type] + name : getAttribute(name, type) 
    }

    //start
    let temp = []

    temp.push(document.querySelectorAll(getName(name, type)))
    temp = Array.from(temp[0])

    return temp;
}

export let globalType = 'task'

let nameModel = document.getElementById("nameModel")

function addEvent({ elements = [], event = '', style = () => {} }) {
    elements.flat().forEach((el) => {
        el.addEventListener(event, style);
    });
}

function taskAnimated(){
    let button;

    button = getElements({name: 'selectTypeButton',type: 'class',});


        button[0].addEventListener('click', () => {
            button[0].classList.add('typeChecked');
            button[1].classList.remove('typeChecked');
            nameModel.focus()

            globalType = 'task'
        })
        
        button[1].addEventListener('click', () => {
            button[1].classList.add('typeChecked')
            button[0].classList.remove('typeChecked')
            nameModel.focus()

            globalType = 'folder'
        })
        
}

function showTaskManager(){
    let finish, taskManager, modelName, style;
    var nameModelFocus = false;

    finish = getElements({name: 'finishModel', type: 'id'})
    taskManager = getElements({name: 'taskManager', type: 'id'})
    modelName = getElements({name: 'nameModel', type: 'id'})
    style = [() => {
        taskManager[0].classList.add('finishModelHover')
    },
    () => {
        if(!nameModelFocus){
            taskManager[0].classList.remove('finishModelHover')
        }
    }
    ]

    
    addEvent({elements: [modelName], event: "focus", style: () => {nameModelFocus = true;}})
    addEvent({elements: [modelName], event: "blur", style: () => {nameModelFocus = false;}})

    addEvent({elements: [finish, taskManager], event: "mouseover", style: style[0]})
    addEvent({elements: [finish, taskManager], event: "mouseout", style: style[1]})

    taskManager[0].classList.add('finishModelHover')
}

taskAnimated()
showTaskManager()
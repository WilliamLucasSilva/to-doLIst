function attTree(tree){
    localStorage.clear()
    localStorage.setItem("tree", JSON.stringify(tree))
}

function navigateTo(path, obj) {
    const parts = path.split("/");
    let current = obj;
    for (let part of parts) {
        if (part && current.children[part]) {
            current = current.children[part];
        } else if (part) {
            return null;
        }
    }
    return current;
    console.log(current)
}

export function addFolder(daddyPath, path, name){
    let tree = JSON.parse(localStorage.getItem('tree'))
    let obj = navigateTo(daddyPath, tree)

    obj.children[name] = {
        name: name,
        path: path,
        type: 'folder',
        children: {},
    }

    attTree(tree)
} 

export function addTask(daddyPath, path, name, checked){
    let tree = JSON.parse(localStorage.getItem('tree'))
    let obj = navigateTo(daddyPath, tree)

    obj.children[name] = {
        name: name,
        path: path,
        type: 'task',
        checked: checked,
    }

    attTree(tree)
}

export function checkedTree(daddyPath, name, checked){
    let tree = JSON.parse(localStorage.getItem('tree'))
    let obj = navigateTo(daddyPath, tree)

    obj.children[name].checked = checked

    attTree(tree)
}

export function removeTree(path, name){
    let tree = JSON.parse(localStorage.getItem('tree'))
    let obj = navigateTo(path, tree)

    delete obj.children[name]
    
    attTree(tree)
}

export const SDK = {
    addFolder: addFolder,
    addTask: addTask,
    removeTree: removeTree,
}
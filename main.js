import { system } from "./js/system.js";
import { globalSelect } from "./js/globalSelect.js";
import { SDK } from "./js/tree.js";
import { load } from "./js/loadSave.js";

if(localStorage.getItem("tree")){
    console.log(JSON.parse(localStorage.getItem("tree")).children)
    load()
}else{
    localStorage.setItem("tree", JSON.stringify({
        name: 'root',
        path: '/',
        type: 'folder',
        children: {},
    }))
}

const SHARE = {
    NAME: document.getElementById("inputName"),
    TYPE: document.getElementById("toDo").checked ? "task" : "folder",
};

document.getElementById("sendForm").addEventListener("submit", (event) => {
    event.preventDefault()
})

document.getElementById("send").addEventListener("click", () => {
    SHARE.TYPE = document.getElementById("toDo").checked ? "task" : "folder";
    let NAME = SHARE.NAME.value;
    if (!NAME) {
        alert("Preencha o campo de texto!");
        return;
    }

    system.addChildren(globalSelect.selected[0], NAME, SHARE.TYPE);

    let path = globalSelect.selected[0] == '/' ? `/${NAME}` : `${globalSelect.selected[0]}/${NAME}`

    if(SHARE.TYPE == "folder"){
        SDK.addFolder(globalSelect.selected[0], path, NAME)
    }else{
        SDK.addTask(globalSelect.selected[0], path, NAME, false)
    }
});

document.getElementById("exclude").addEventListener("click", () => {
    if(globalSelect.selectedExclude[0] != null){
        system.remove(globalSelect.selectedExclude[0].path, globalSelect.selectedExclude[0].name)
        SDK.removeTree(globalSelect.selectedExclude[0].path, globalSelect.selectedExclude[0].name)
    }
})
Array.from(document.getElementsByTagName('form')).forEach((element) => {
    element.addEventListener('submit', (event) => {
        event.preventDefault()     
    })
})


import { system } from "./js/system.js";
import { globalSelect } from "./js/globalSelect.js";
import { globalType } from "./js/animations.js";

//import { load } from "./js/loadSave.js";

//local storage check
/*
if(localStorage.getItem("tree")){
    load()
}else{
    localStorage.setItem("tree", JSON.stringify({
        name: 'root',
        path: '/',
        type: 'folder',
        children: {},
    }))
}

*/


function startRouteCreateModel(){

    // model info
    const nameInput = document.getElementById("nameModel").value.trim();

    // name is empty?
    if (!nameInput) {
        console.error("O nome da tarefa é obrigatório.");
        return;
    }

    system.addChildren(globalSelect.select[0], nameInput, globalType)

    document.getElementById("taskManager").reset()
}

//dom manager ------------------------------------------------------------------------------------------

document.getElementById("taskManager").addEventListener("submit", (event) => { event.preventDefault(); startRouteCreateModel(); });

//exclui object
/*
document.getElementById("exclude").addEventListener("click", () => {
    if(globalSelect.selectedExclude[0] != null){
        system.remove(globalSelect.selectedExclude[0].path, globalSelect.selectedExclude[0].name)
        SDK.removeTree(globalSelect.selectedExclude[0].path, globalSelect.selectedExclude[0].name)
    }
})
*/


import { system } from "./system.js"

export function load() {
  loop(JSON.parse(localStorage.getItem('tree')))
}

function loop(obj) {
    if (obj.children && Object.values(obj.children).length) {
      for (const e of Object.values(obj.children)) {

      system.addChildren(obj.path, e.name, e.type);
      if (e.type === 'task') {
        if (e.checked) {
          system.search(e.path).checked;
        }
      } else if (e.type === 'folder') {
        loop(e);
      }
      }
    }
}
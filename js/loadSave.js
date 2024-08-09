import { system } from "./system.js"

function removeWord(str, word) {
    
    const regex = new RegExp(`\\b${word}\\b`, 'gi');

    return str.replace(regex, '').trim();
  }

  function getParentPath(e) {
    if (e.path === `/${e.name}`) {
      return '/';
    } else {
      let newPath = removeWord(e.path, `/${e.name}`);
      
      return newPath ? `/${newPath}` : '/';
    }
  }

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
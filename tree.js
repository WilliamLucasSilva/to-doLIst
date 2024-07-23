class BaseElement{
  constructor(daddy, name, construct = true){
      this.name = name
      this.daddy = daddy
      
      construct ? this.create() : null
  }

  create(){
      switch (this.type) {
          case "folder":
              this.element = document.createElement("button")
              this.element.classList.add("folder")
              this.element.innerHTML = `${SYMBOLS.open} ${this.name}`
              
              this.div = document.createElement("div")
              this.daddy.appendChild(this.element)
              this.daddy.appendChild(this.div)

              this.element.addEventListener("click", (event) => {
                  event.stopPropagation()
                  changeSelected(this.div)
              })

              this.div.addEventListener("click", (event) => {
                  event.stopPropagation()
                  changeSelected(this.div)
              })
              break;
          case "task":
              this.element = document.createElement("div")
              this.element.innerHTML = TASK_INNER(this.name)
              this.daddy.appendChild(this.element)
              break;
          default:
              console.error("Tipo desconhecido:", this.type);
              return;
      }

  }
}

class Folder extends BaseElement{
  constructor(daddy, name, construct = true){
      super(daddy, name, construct = true)
      this.type = "folder"
      this.children = {}
      this.open = true
  }
    
  addChildren(name, type) {
    if(!this.children[name]){
      switch(type){
        case "folder":
          this.children[name] = new Folder(this.element, name)
          break;
        case "task":
          this.children[name] = new Task(this.element, name)
          break;
        default:
          alert(`the '${type}' is unknow`)
        }
    }else{
      alert(`The ${type} '${name}' already exists.`);
    }
  }

  remove(name) {
    if (this.children[name]) {
      delete this.children[name];
    } else {
      console.log(`'${name}' does not exist.`);
    }
  }

  search(name) {
    return this.children[name] || null;
  }

  list() {
    console.log(`Contents of folder '${this.name}':`);
    for (let key in this.children) {
      console.log(`- ${key}`);
    }
  }
}

class Task extends BaseElement{
  constructor(daddy, name, construct = true){
      super(daddy, name)
      this.type = "task"
  }
}

class FileSystem {
  constructor() {
    this.root = new Folder(null, 'root', false);
    this.root.element = document.getElementById("main") 
  }

  addFolder(path, name, type) {
    const folder = this.navigateTo(path);
    if(folder){
      if (folder.type == "folder") {
        folder.addChildren(name, type);
      } else {
        alert("this is not a folder")
      }
    }else{
      alert(`Path '${path}' does not exist.`);
    }
  }

  remove(path, name) {
    const folder = this.navigateTo(path);
    if (folder) {
      if(folder.type == "folder"){
        folder.remove(name);
      }else{
        alert("this is not a folder")
      }
    } else {
      alert(`Path '${path}' does not exist.`);
    }
  }

  search(path, name) {
    const folder = this.navigateTo(path);
    if (folder) {
      return folder.search(name);
    } else {
      console.log(`Path '${path}' does not exist.`);
      return null;
    }
  }

  list(path) {
    const folder = this.navigateTo(path);
    if (folder) {
      folder.list();
    } else {
      console.log(`Path '${path}' does not exist.`);
    }
  }

  navigateTo(path) {
    const parts = path.split('/');
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

//--------------------------------------------------------------------

class Node {
    constructor(name, value) {
      this.name = name;
      this.children = {};
      this.value = value
    }
  
    addFolder(name, value) {
      if (!this.children[name]) { //como fazer com nomes repetidos? não deve ter
        this.children[name] = new Node(name, value)
        this.children[name].create()
      } else {
        console.log(`Folder '${name}' already exists.`);
      }
    }
  
    addFile(name, value) {
      if (!this.children[name]) {
        this.children[name] = value
      } else {
        console.log(`File '${name}' already exists.`);
      }
    }
  
    remove(name) {
      if (this.children[name]) {
        delete this.children[name];
      } else {
        console.log(`'${name}' does not exist.`);
      }
    }
  
    search(name) {
      return this.children[name] || null;
    }
  
    list() {
      console.log(`Contents of folder '${this.name}':`);
      for (let key in this.children) {
        console.log(`- ${key}`);
      }
    }
  }
  
  class FileSystem {
    constructor() {
      this.root = new Node('root');
    }
  
    addFolder(path, value) {
      const folder = this.navigateTo(path);
      if (folder) {
        folder.addFolder(value.name, value);
      } else {
        console.log(`Path '${path}' does not exist.`);
      }
    }
  
    addFile(path, value) {
      const folder = this.navigateTo(path);
      if (folder) {
        folder.addFile(value.name, value);
      } else {
        console.log(`Path '${path}' does not exist.`);
      }
    }
  
    remove(path, name) {
      const folder = this.navigateTo(path);
      if (folder) {
        folder.remove(name);
      } else {
        console.log(`Path '${path}' does not exist.`);
      }
    }
  
    search(path, name) {
      const folder = this.navigateTo(path);
      if (folder) {
        return folder.search(name);
      } else {
        console.log(`Path '${path}' does not exist.`);
        return null;
      }
    }
  
    list(path) {
      const folder = this.navigateTo(path);
      if (folder) {
        folder.list();
      } else {
        console.log(`Path '${path}' does not exist.`);
      }
    }
  
    navigateTo(path) {
      const parts = path.split('/');
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
  
  // Exemplo de uso
  const fs = new FileSystem();
  
  fs.addFolder('/', 'documents');
  fs.addFolder('/documents', 'photos');
  fs.addFile('/documents', 'resume.pdf');
  fs.addFile('/documents/photos', 'vacation.jpg');
  
  fs.list('/'); // Deve listar 'documents'
  fs.list('/documents'); // Deve listar 'photos' e 'resume.pdf'
  fs.list('/documents/photos'); // Deve listar 'vacation.jpg'
  
  console.log(fs.search('/documents', 'resume.pdf')); // Deve retornar o arquivo 'resume.pdf'
  console.log(fs.search('/documents', 'nonexistent.pdf')); // Deve retornar null
  
  fs.remove('/documents', 'resume.pdf');
  fs.list('/documents'); // Deve listar apenas 'photos'
  
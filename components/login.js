import dataBase from "../dataBase/dataBase.js";

document.addEventListener('DOMContentLoaded', function () {
    const inputs = document.querySelectorAll('input');

    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (!input.checkValidity()) {
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
            }
        });
    });
});

const form = document.getElementById("login");
const path =  dataBase.db.collection('Login')

form.addEventListener('submit', function(event){
    event.preventDefault()

    path.doc(`${username.value}`).get().then((doc) => {
        if (doc.exists) {
            if(password.value == doc.data().password){
                localStorage.clear()
                localStorage.setItem('username', username.value);
                window.location.href = '../index.html';
            }else{
                alert("invalid password")
            }
        } else {
            alert("this user no exist");
            
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      })

      
})

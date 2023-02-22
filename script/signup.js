import { KEYS, getUser } from "./data.js";

let form = document.getElementById("signup-form")
let error = form.querySelector(".error")

form.onsubmit = (e) => {
    e.preventDefault()

    let user = getUser(form.email.value)
    
    if(user == undefined){
         let userData = {
            fn: form.fname.value,
            ln: form.lname.value,
            em: form.email.value,
            ps: form.password.value
         }
         let allUsers = getUser()
         allUsers.push(userData)

         localStorage.setItem(KEYS.user, JSON.stringify(allUsers))

         location.href = "signin.html"
    }
    else{
        error.textContent = "Email id already registered!"
    }
}
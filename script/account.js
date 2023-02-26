import { KEYS, getUser, auth } from "./control.js";

if(auth()){
    location = "/"
}

// sign up
let signUpForm = document.getElementById("signup-form")

if(signUpForm){
    let error = signUpForm.querySelector(".error")
    
    signUpForm.onsubmit = (e) => {
        e.preventDefault()

        let user = getUser(signUpForm.email.value)
    
        if(user == undefined){
            let userData = {
                fn: signUpForm.fname.value,
                ln: signUpForm.lname.value,
                em: signUpForm.email.value,
                ps: signUpForm.password.value,
                st: 1
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
}
// sign in

let signInForm = document.getElementById("signin-form")

if(signInForm){
    let error = signInForm.querySelector(".error")

    signInForm.onsubmit = (e) => {
        e.preventDefault()

        let { data } = getUser(signInForm.email.value)

        if(data){
            if(data.ps == signInForm.password.value){
                if(data.st == -1){
                    error.textContent = "You're blacklisted by Admin"
                }
                else{
                    let userId = data.em.split("@")[0]
                    localStorage.setItem(KEYS.loggedIn, btoa(userId))
                    location.href = "/"
                }
            }
            else{
                error.textContent = "Password does not match"
            }
        }
        else{
            error.textContent = "Account not found"
        }
    }
}
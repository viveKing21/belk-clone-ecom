import { KEYS, getUser, isLoggedIn } from "./control.js";

if(isLoggedIn()){
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
                ps: signUpForm.password.value
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

        let user = getUser(signInForm.email.value)

        if(user){
            if(user.ps == signInForm.password.value){
                error.textContent = "Password does not match"
            }
            else{
                let userId = user.em.split("@")[0]
                localStorage.setItem(KEYS.loggedIn, btoa(userId))
                location.href = "/"
            }
        }
        else{
            error.textContent = "Account not found"
        }
    }
}
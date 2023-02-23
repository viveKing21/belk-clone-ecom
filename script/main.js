import { isLoggedIn } from "./control.js"

if(isLoggedIn()){
    document.getElementById("sign-in").remove()
    document.getElementById("sign-up").remove()
}
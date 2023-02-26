import { auth, getCart } from "./control.js"

if(auth()){
    document.getElementById("sign-in").remove()
    document.getElementById("sign-up").remove()

    let cart = document.querySelector("nav .cart")
    let { data } = getCart()
    let count = 0
    for(let key in data){
        count += data[key].length
    }
    if(count) cart.dataset.item = count
}

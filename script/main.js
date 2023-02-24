import { isLoggedIn, getCart } from "./control.js"

if(isLoggedIn()){
    document.getElementById("sign-in").remove()
    document.getElementById("sign-up").remove()

    let cart = document.querySelector("nav .cart")
    getCart()
    .then(data => {
        let count = 0
        for(let key in data){
            count += data[key].length
        }
        if(count) cart.dataset.item = count
    })
}
import { getCartItems, auth, currency, getCart } from "./control.js"

let navCart = document.querySelector("nav .cart")
let cartContainer = document.querySelector(".cart-container")
let cartCount = cartContainer.querySelector(".item-count")
let content = cartContainer.querySelector(".content")

let cartDetails = cartContainer.querySelector(".cart-details")
let totalPrice = cartDetails.querySelector(".t-p")
let sellingPrice = cartDetails.querySelector(".s-p")
let discounts = cartDetails.querySelector(".d")
let finalPrice = cartDetails.querySelector(".fp")

let empty = document.querySelector(".empty")

const createCard = (item, key) => {
    let card = document.createElement("div")
    let image = document.createElement("div")
    let pic = document.createElement("img")
    let cardTitle = document.createElement("div")
    let price = document.createElement("div")
    let btn = document.createElement("button")

    card.className = "card"
    image.className = "img"
    cardTitle.className = "card-title"
    price.className = "price"

    pic.src = item.images[0]
    cardTitle.textContent = item.title
    
    btn.textContent = "Remove from Cart"

    btn.onclick = () => {
        let {data, update} = getCart()
        
        data[key] = data[key].filter(id => id != item.id)
        if(data[key].length == 0) delete data[key];
        update()

        getCartItems()
        .then(({data}) => generateUi(data))

        if(--navCart.dataset.item < 1) delete navCart.dataset.item
    }
    image.appendChild(pic)
    card.append(image, cardTitle)

    if(item.discount){
        let final = (item.price * (1 - item.discount)).toFixed(2)
        price.innerHTML = "$" + final + " <span>after coupon</span>"
        let off = document.createElement("strike")
        off.textContent = "$" + item.price.toFixed(2)
        card.append(price, off)
    }
    else{
        price.textContent = "$" + item.price
        card.append(price)
    }
    card.append(btn)
    return card
}

function generateUi(cartItems){
    content.innerHTML = "";

    if(cartItems == undefined){
        empty.style.display = null
        cartContainer.style.display = "none"
        empty.querySelectorAll(".no-auth")
        .forEach(el => el.remove())
        return
    }
    
    cartContainer.style.display = null
    
    let count = 0

    let total_price = 0
    let off_price = 0
    
    for(let key in cartItems){
        cartItems[key].forEach(item => {
            total_price += item.price
            off_price += item.price * (1 - (item.discount || 0))
            content.appendChild(createCard(item, key))
        })
        count += cartItems[key].length
    }

    sellingPrice.textContent = totalPrice.textContent = currency(total_price)
    finalPrice.firstElementChild.textContent = currency(off_price + (off_price * .18))

    if(total_price == off_price) discounts.parentElement.remove()
    else {
        finalPrice.lastElementChild.textContent = currency(total_price + (total_price * 0.18))
        discounts.textContent = ((1 - off_price / total_price) * 100).toFixed(2) + "%"
    }
    
    cartCount.textContent = count
}

if(auth()){
    getCartItems()
    .then(({data}) => generateUi(data))
}
else{
    empty.style.display = null
    cartContainer.style.display = "none"
}

import { KEYS, getProduct, auth, getCart } from "./control.js"

let cartCount = document.querySelector("nav .cart")

let query = new URLSearchParams(location.search)

if(query.has("page") == false) location = "/NotFound.html"

const title = document.querySelector(".products > .title")
const productContainer = document.querySelector(".products .content")
const filterContainer = document.querySelector(".filter")
const sort = document.querySelector(".sort select")

const filterBy = {}

let productData = [];

const createCard = (item) => {
    let card = document.createElement("div")
    let image = document.createElement("div")
    let pic = document.createElement("img")
    let cardTitle = document.createElement("div")
    let price = document.createElement("div")
    let addBtn = document.createElement("button")
    let buyBtn = document.createElement("button")

    card.className = "card"
    image.className = "img"
    cardTitle.className = "card-title"
    price.className = "price"

    pic.src = item.images[0]
    cardTitle.textContent = item.title
    
    addBtn.textContent = "Add to Cart"
    buyBtn.textContent = "Buy Now"

    buyBtn.onclick = () => {
        location = `checkout.html?products=${item.id}&page=${query.get("page")}`
    }
    
    if(auth()){
        let {data} = getCart()
        if(data && data[query.get("page")]?.includes(item.id)) {
            addBtn.textContent = "Remove to Cart"
        }
    }
    addBtn.onclick = () => {
        if(auth()){
            let {data, update} = getCart()
            let cart = data || {};
            let list = cart[query.get("page")] || []

            if(cartCount.dataset.item == null) cartCount.dataset.item = 0

            if(list.includes(item.id) == false){
                list.push(item.id)
                cart[query.get("page")] = list
                cartCount.dataset.item++
                addBtn.textContent = "Remove to Cart"
            }
            else{
                list = list.filter(id => id != item.id)
                if(list.length == 0){
                    delete cart[query.get("page")]
                    delete cartCount.dataset.item
                    
                    if(Object.keys(cart).length == 0) {
                        localStorage.removeItem(KEYS.cart)
                    }
                }
                else{
                    cart[query.get("page")] = list
                    cartCount.dataset.item--
                }
                addBtn.textContent = "Add to Cart"
            }
            update(cart)
        }
        else{
            location = "/signin.html"
        }
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
    card.append(addBtn, buyBtn)
    return card
}

const createFilter = (items) => {
    let colorContainer = filterContainer.querySelector(".colors")
    let genderContainer = filterContainer.querySelector(".genders")
    let brandContainer = filterContainer.querySelector(".brands")
    
    let colors = {}, hasColor = false
    let genders = {}, hasGender = false
    let brands = {}, hasBrand = false

    items.forEach(item => {
        if(item.spec.color != "*"){
            if(!colors[item.spec.color]) colors[item.spec.color] = 0
            colors[item.spec.color]++
            hasColor = true
        }
        if(item.spec.gender != "*"){
            if(!genders[item.spec.gender]) genders[item.spec.gender] = 0
            genders[item.spec.gender]++
            hasGender = true
        }
        if(item.spec.brand != "*"){
            if(!brands[item.spec.brand]) brands[item.spec.brand] = 0
            brands[item.spec.brand]++
            hasBrand = true
        }
    })

    const colorFilter = (colors, container) => {
        container.innerHTML = ""
        colors.forEach((color) => {
            let main = document.createElement("div")
            let circle = document.createElement("div")
            let text = document.createElement("div")
    
            main.className = "color"
            circle.className = "circle"
            text.className = "name"
    
            circle.style.backgroundColor = color
            text.textContent = color
            
            main.onclick = () => {
                if(main.classList.contains("selected")){
                    filterBy.color = filterBy.color.filter(cl => cl != color)
                }
                else filterBy.color.push(color)
                main.classList.toggle("selected")
                generateUi(productData)
            }
            main.append(circle, text)
            container.append(main)
        })
    }
    const selectFilter = (id, data, container) => {
        container.innerHTML = ""
        for(let item in data){
            let main = document.createElement("div")
            let label = document.createElement("label")
            let input = document.createElement("input")
            let checkbox = document.createElement("div")
            let count = document.createElement("span")

            main.className = id
            checkbox.className = "checkbox"
            main.setAttribute("value", item)
            input.type = "checkbox"
            count.textContent = `(${data[item]})`

            input.oninput = () => {
                if(input.checked) filterBy[id].push(item)
                else filterBy[id] = filterBy[id].filter(tag => tag != item)
                generateUi(productData)
            }

            label.append(input, checkbox, item, count)
            main.append(label)
            container.append(main)
        }
    }

    if(hasColor) {
        colorFilter(Object.keys(colors), colorContainer)
        filterBy.color = []
    }
    else colorContainer.parentElement.remove()
    
    if(hasGender) {
        selectFilter("gender", genders, genderContainer)
        filterBy.gender = []
    }
    else genderContainer.parentElement.remove()

    if(hasBrand) {
        selectFilter("brand", brands, brandContainer)
        filterBy.brand = []
    }
    else brandContainer.parentElement.remove()
    
}

const generateUi = (items) => {
    productContainer.innerHTML = ""

    let itemCount = 0
    items.forEach(item => {
        for(let key in filterBy){
            if(filterBy[key].length == 0 || item.spec[key] == "*") continue
            if(filterBy[key].includes(item.spec[key]) == false) return;
        }
        itemCount++
        productContainer.append(createCard(item))
    })
    title.textContent = `${query.get("page")} (${itemCount})`
}

getProduct()
.then(({data}) => {
    productData = data
    generateUi(data)
    createFilter(data)
})
.catch(error => {
    document.querySelector(".product-container").innerHTML = "<h3>Not Product Found.</h3>"
})

sort.onchange = () => {
    getProduct()
    .then(({data}) => [...data])
    .then(shallowData => {
        if(sort.value == "htl"){
            shallowData.sort((a, b) => {
                let priceA = a.price * (1 - (a.discount || 0))
                let priceB = b.price * (1 - (b.discount || 0))
                return priceB - priceA
            })
        }
        else if(sort.value == "lth"){
            shallowData.sort((a, b) => {
                let priceA = a.price * (1 - (a.discount || 0))
                let priceB = b.price * (1 - (b.discount || 0))
                return priceA - priceB
            })
        }
        else if(sort.value == "off"){
            shallowData.sort((a, b) => {
                return (b.discount || 0) - (a.discount || 0)
            })
        }
        productData = shallowData
        generateUi(shallowData)
    })
}
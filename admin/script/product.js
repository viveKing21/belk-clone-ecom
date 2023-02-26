import { getCart, KEYS, getProduct } from "../../script/control.js"

let query = new URLSearchParams(location.search)

if(query.has("page") == false) location = "/NotFound.html"

let productData = []

let addProductForm = document.getElementById("add-to-cart")
let productContainer = document.querySelector(".product-content")

let title = document.querySelector(".main-container .title")
let search = document.querySelector(".search input")
let searchBtn = document.querySelector(".search span")
let clearSearch = document.querySelector(".clear-search")
let sort = document.querySelector(".sort select")

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
    
    btn.textContent = "Delete This Product"
   
    btn.onclick = () => {
        productData = productData.filter(product => product.id != item.id)
        let data = JSON.parse(localStorage.getItem(KEYS.product))
        data[query.get("page")] = productData
        localStorage.setItem(KEYS.product, JSON.stringify(data))
        generateUi(productData)

        let { data: carts, update } = getCart()
        carts[query.get('page')] = carts[query.get('page')].filter(id => id != item.id)
        update()
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

function generateUi(products){
    productContainer.innerHTML = ""
    let count = 0
    products.forEach(product => {
        if(product.title.toLowerCase().includes(search.value.toLowerCase()) == false) return
        count++
        productContainer.append(createCard(product))
    })
    title.textContent = `${query.get("page")} (${count})`
}

// search
let prevSearch = ""
searchBtn.onclick = () => {
    if(search.value && search.value != prevSearch){
        generateUi(productData)
        prevSearch = search.value
        clearSearch.innerHTML = `Searched "${prevSearch}" <span>clear</span>`
        clearSearch.firstElementChild.onclick = () => {
            search.value = prevSearch = ""
            generateUi(productData)
            clearSearch.innerHTML = ""
        }
    }
}

// sort
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

// initialize
let allBrands = new Set;

getProduct()
.then(({ data }) => {
    generateUi(data)
    productData = data
})
.catch((e) => {
    document.querySelector(".empty").hidden = false
})
.finally(() => {
    // bit ui data
    allBrands = new Set(productData.map(p => p.spec.brand))
    let datalist = addProductForm.querySelector("datalist")
    allBrands.forEach(brand => {
        let option = document.createElement("option")
        option.value = brand.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")
        datalist.append(option)
    })
})


// add product
const isUncorruptedUrl = async url => {
    try{
        let res = await fetch(url)
        let { type } = await res.blob()
        if(type.includes("image") == false) throw "No image found"
    }
    catch(e){
        console.clear()
        throw "Failed to fetch"
    }
}
addProductForm.onsubmit = async e => {
    e.preventDefault()

    let id = productData.reduce((acc, cur) => acc.id > cur.id ? acc:cur).id + 1;

    let product = {
        id,
        title: addProductForm.name.value,
        images: [addProductForm.image.value],
        price: addProductForm.price.valueAsNumber,
        discount: addProductForm.discount.valueAsNumber / 100,
        spec: {
            color: addProductForm.color.value.toLowerCase(),
            gender: addProductForm.gender.value.toLowerCase(),
            brand: addProductForm.brand.value.toLowerCase()
        }
    }

    if(isNaN(product.discount)) delete product.discount;
    addProductForm.parentElement.setAttribute("loading", true)
    try{
        await isUncorruptedUrl(product.images[0]) // verifying image

        let data = JSON.parse(localStorage.getItem(KEYS.product))

        data[query.get("page")].push(product)

        localStorage.setItem(KEYS.product, JSON.stringify(data))

        sort.onchange()

        modal.hidden=true

        // bit ui data
        if(allBrands.has(product.spec.brand) == false){
            let datalist = addProductForm.querySelector("datalist")
            let option = document.createElement("option")
            option.value = product.spec.brand.split(" ").map(word => word[0].toUpperCase() + word.slice(1)).join(" ")
            datalist.append(option)
        }
    }
    catch(e){
        addProductForm.image.value = ""
        addProductForm.image.className = "error"
        addProductForm.image.placeholder = "Invalid Image Url"
        addProductForm.image.focus()
    }
    finally{
        addProductForm.parentElement.removeAttribute("loading")
    }
}


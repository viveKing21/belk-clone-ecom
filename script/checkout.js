import { auth, currency, getCartItems, getCurrentUser, getOrder, getProduct, KEYS } from "./control.js"

if(auth() == null){
    location = "/signin.html"
}

let query = new URLSearchParams(location.search)

let isCartProducts = query.get("products") == "cart"

let checkoutContainer = document.querySelector(".checkout-container")
let title = checkoutContainer.querySelector("h3")
let steps = checkoutContainer.querySelector(".steps")
let stepsPage = steps.querySelectorAll(".step")
let stepDetails = checkoutContainer.querySelector(".details")
let controls = checkoutContainer.querySelector(".control")
let msg = document.querySelector(".msg")

if(!query.has("products") || !isCartProducts && !query.has("page")){
    msg.textContent = "No product found"
}

let productsData;

let getItems;

if(isCartProducts){
    getItems = getCartItems().then(({data}) => data)
}
else{
    getItems = getProduct(query.get("products"))
    .then(({data}) => ({[query.get("page")]: [data]}))
}

getItems.then(data => {
    if(data){
        productsData = data
        initialize()
    }
    else{
        msg.textContent = "No product found"
    }
})


let {data: {fn, ln, em}} = getCurrentUser()

const ORDER_DATA = {
    user: {
        name: fn + " " + ln,
        email: em
    }
}

let currentStep = 1;

// step 1
let productContainer = stepsPage[0].querySelector(".product-container")
let priceDetails = stepsPage[0].querySelector(".cart-details")

const updatePriceUi = (productsData) => {
    let total_price = 0
    let off_price = 0

    let totalPrice = priceDetails.querySelector(".t-p")
    let sellingPrice = priceDetails.querySelector(".s-p")
    let discounts = priceDetails.querySelector(".d")
    let finalPrice = priceDetails.querySelector(".fp")

    for(let page in productsData){
        productsData[page].forEach(item => {
            total_price += item.price
            off_price += item.price * (1 - (item.discount || 0))
        })
    }

    sellingPrice.textContent = totalPrice.textContent = currency(total_price)
    finalPrice.firstElementChild.textContent = currency(off_price + (off_price * .18))

    if(total_price == off_price) {
        discounts.parentElement.remove()
        finalPrice.lastElementChild.textContent = ""
    }
    else {
        finalPrice.lastElementChild.textContent = currency(total_price + (total_price * 0.18))
        discounts.textContent = ((1 - off_price / total_price) * 100).toFixed(2) + "%"
    }
}
const itemListCreate = (items, key) => {
    items.forEach((item, i) => {
        let div = document.createElement("div")
        let img = document.createElement("img")
        let details = document.createElement("div")
        let name = document.createElement("div")
        let price = document.createElement("div")
        let btn = document.createElement("span")

        div.className = "product"
        details.className = "details"
        name.className = "title"
        price.className = "price"
        btn.className = "material-symbols-outlined"

        img.src = item.images[0]
        name.textContent = item.title
        price.innerHTML = `<span>${currency(item.price)}</span>`
        btn.textContent = "delete"

        btn.onclick = () => {
            items.splice(i, 1)
            div.remove()
            updatePriceUi(productsData)
            title.dataset.count--
            title.textContent = `Items (${title.dataset.count})`
            if(title.dataset.count == 0) msg.textContent = "No Product"
        }

        if(item.discount){
            let discount = document.createElement("div")
            discount.className = "discount"
            discount.textContent = (item.discount * 100) + "%"

            price.innerHTML = `<span>${currency(item.price * (1 - item.discount))}</span> <b>after coupon</b><br>
            <strike>${currency(item.price)}</strike>`
            details.append(name, price, discount)
        }
        else details.append(name, price)

        div.append(img, details, btn)
        productContainer.append(div)
    })
}

// step 2
let billingContainer = stepsPage[1].querySelector(".billing-container")
let billingForm = billingContainer.querySelector("form")

const nextStep = () => {
    if(currentStep == 3) return
    let titles = ['', "Billing Address", "Payment Details"]
    stepsPage[currentStep-1].hidden = true
    stepsPage[currentStep].hidden = false
    title.textContent = titles[currentStep]
    
    controls.firstElementChild.style.visibility = "visible"
    if(currentStep == 2){
        controls.lastElementChild.style.visibility = "hidden"
    }
    currentStep++
}
const prevStep = () => {
    if(currentStep == 1) return
    let total = 0;
    if(currentStep == 2){
        total = Object.values(ORDER_DATA.items).reduce((a,c) => a+c.length, 0)
    }
    let titles = [`Items (${total})`, "Billing Address", "Payment Details"]
    stepsPage[currentStep-1].hidden = true
    stepsPage[currentStep-2].hidden = false
    title.textContent = titles[currentStep-2]
    
    controls.lastElementChild.style.visibility = "visible"
    if(currentStep == 2){
        controls.firstElementChild.style.visibility = "hidden"
    }
    currentStep--
}

billingForm.onsubmit = (e) => {
    e.preventDefault()
    // step 2 next code
    let formData = Object.fromEntries((new FormData(billingForm)).entries())
    ORDER_DATA.billing_address = formData
    nextStep()
}

// step 3
let paymentContainer = stepsPage[2].querySelector(".payment-container")
let paymentForm = paymentContainer.querySelector('form')
let otps = [...document.querySelectorAll(".otp-box input")]
let verify = document.querySelector(".otp-page button")
let resend = document.querySelector(".otp-page .resend")
let resendBtn = resend.querySelector(".action b")
let resendTime = resend.querySelector(".timer b")

let otp = []

const generateOtp = () => {
    return [Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10),Math.floor(Math.random()*10)]
}

paymentForm.onsubmit = (e) => {
    e.preventDefault()
    let payment = Object.fromEntries((new FormData(paymentForm)).entries())
    
    otp = generateOtp()
    otps.forEach((inp, i) => inp.placeholder = otp[i])
    modal.hidden = false
}

resendBtn.onclick = () => {
    otp = generateOtp()
    otps.forEach((inp, i) => inp.placeholder = otp[i])
    resend.setAttribute("timer", true)

    let time = 30

    resendTime.textContent = time

    let interval = setInterval(() => {
        resendTime.textContent = --time + 's'
        if(time == 0){
            clearInterval(interval)
            resend.removeAttribute("timer")
        }
    }, 1000)
}

verify.onclick = () => {
    let matched = otps.filter((inp, i) => inp.value == otp[i])
    if(matched.length == otp.length){
        modal.firstElementChild.setAttribute("loading", true)

        let {data, update} = getOrder()


        let max = 0;
        if(data.length) max = data.reduce((a,c) => a.id > c.id ? a:c).id
        else max = 1000;
        
        ORDER_DATA.id = max+1

        data.push(ORDER_DATA)

        update()

        if(isCartProducts){
            localStorage.removeItem(KEYS.cart)
        }

        let delayFake = Math.floor(Math.random() * (7000 - 2000) + 2000)
        setTimeout(() => {
            location = "order.html?order_id=" + ORDER_DATA.id
        }, delayFake)
    }
    else{
        otps.forEach(otp => {
            otp.value = ''
            otp.style.borderColor="red"
        })
        otps[0].focus()
    }
}

function initialize(){
    productContainer.innerHTML = ""

    updatePriceUi(productsData)

    let count = 0
    for(let page in productsData){
        count += productsData[page].length
        itemListCreate(productsData[page], page)
    }
    title.dataset.count = count
    title.textContent = `Items (${count})`
    // prev btn
    controls.firstElementChild.onclick = () => {
        prevStep()
    }
    // next btn
    controls.lastElementChild.onclick = () => {
        if(currentStep == 1){
            // step 1 next code
            let allItems = Object.entries(productsData)
            if(allItems.length == 0) return alert("Something went wrong")
            allItems = allItems.map(([page, products]) => [page, products.map(p => p.id)])
            allItems = Object.fromEntries(allItems)
            
            ORDER_DATA.items = allItems;
            nextStep()
        }
        else if(currentStep == 2) {
            billingForm.requestSubmit()
            return
        }
    }
}


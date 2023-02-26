import { currency, getOrder, getProduct } from './control.js'

let query = new URLSearchParams(location.search)

if(query.has("order_id") == false) location = "/NotFound.html"

let {data: order} = getOrder(query.get("order_id"))

if(order == undefined || order.length == 0) location = "/NotFound.html"

let orderId = document.querySelector("#order-id span")
let billingAdd = document.getElementById("billing-address")

orderId.textContent = "#" + order.id

let b_name = billingAdd.querySelector(".name")
let b_email = billingAdd.querySelector(".email")
let b_mobile = billingAdd.querySelector(".mobile")
let b_address = billingAdd.querySelector(".address")

b_name.textContent = order.billing_address.name
b_email.textContent = order.billing_address.email
b_mobile.textContent = order.billing_address.mobile
b_address.textContent = order.billing_address.house + " " + order.billing_address.street + " " + order.billing_address.city + " " + order.billing_address.state + " " + order.billing_address.zipcode;

let itemTable = document.querySelector("table tbody")

let products = [];

let promises = [];


for(let page in order.items){
    order.items[page].forEach(id => {
        console.log(page)
        promises.push(getProduct(id, page).then(({data}) => data))
    })
}
Promise.all(promises)
.then(res => {
    products = res
    generateTable(products)
})

function generateTable(items){
    itemTable.innerHTML = ""

    let totalTax = 0, totalAmount = 0
    items.forEach((item, i) => {
        let tr = document.createElement("tr")
        let sn = document.createElement('td')
        let name = document.createElement('td')
        let price = document.createElement("td")
        let qun = document.createElement("td")
        let tax_rate = document.createElement("td")
        let tax_type = document.createElement("td")
        let tax_amt = document.createElement("td")
        let total = document.createElement("td")

        sn.textContent = i+1
        name.textContent = item.title
        qun.textContent = 1
        price.textContent = currency(item.price)
        tax_rate.textContent = "18%"
        tax_type.textContent = "IGST"
        tax_amt.textContent = currency(item.price * .18)
        total.textContent = currency(item.price + (item.price * .18))

        totalTax += item.price * .18
        totalAmount += item.price

        if(item.discount){
            let offer = item.price * (1 - item.discount)
            price.textContent = currency(offer)
            tax_amt.textContent = currency(offer * .18)
            total.textContent = currency(offer + (offer * .18))

            totalTax += offer * .18
            totalAmount += offer
        } 
        tr.append(sn, name, price, qun, tax_rate,tax_type, tax_amt, total)
        itemTable.append(tr)
    })

    let tr = document.createElement("tr")
    let td = document.createElement("td")
    let tx = document.createElement("td")
    let ta = document.createElement("td")

    tx.style.fontWeight = "bold"
    ta.style.fontWeight = "bold"
    td.setAttribute("colspan", 6)
    tx.textContent = currency(totalTax)
    ta.textContent = currency(totalAmount)

    tr.append(td, tx, ta)

    itemTable.append(tr)
}
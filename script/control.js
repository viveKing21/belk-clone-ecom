
// localstorage
export const KEYS = {
    user: "users",
    loggedIn: "logged_in",
    cart: "cart",
    product: "products",
    order: "orders"
}

export const getUser = (email) => {
    let users = JSON.parse(localStorage.getItem(KEYS.user)) || []
    return {
        data: email ? users.find(user => user.em == email):users,
        update(data = users){
            if(data){
                if(data.length){
                    localStorage.setItem(KEYS.user, JSON.stringify(data))
                    return
                }
            }
            localStorage.removeItem(KEYS.user)
        }
    } 
}
export const getCurrentUser = () => {
    return {
        data: getUser(atob(auth()) + "@gmail.com").data
    } 
}


export const auth = () => {
    let sessionId = localStorage.getItem(KEYS.loggedIn)
    if(sessionId){
        try{
            let { data } = getUser(atob(sessionId) + "@gmail.com")
            if(data && data.st == 1) return sessionId
            else throw "Session Dosen't match";
        }
        catch(e){
            localStorage.removeItem(KEYS.loggedIn)
        }
    }
    return null
}

// async
export const getProduct = async (id, pageName) => {
    if(pageName == null){
        let query = new URLSearchParams(location.search)
        pageName = query.get("page")
    }

    let products = JSON.parse(localStorage.getItem(KEYS.product))

    if(products == null){
        // fetch demo data
        let load = await import('/data/demo.json', { assert: { type: "json" }})
        products = load.default
        localStorage.setItem(KEYS.product, JSON.stringify(products))
    }
    products = products[pageName]
    return {
        data: id ? products.find(p => p.id == id):products
    }
}

export const getCart = () => {
    let carts = JSON.parse(localStorage.getItem(KEYS.cart))
    
    return {
        data: carts,
        update(data = carts){
            if(data){
                if(Object.keys(data).length){
                    localStorage.setItem(KEYS.cart, JSON.stringify(data))
                    return
                }
            }
            localStorage.removeItem(KEYS.cart)
        }
    }
}

export const getOrder = (id) => {
    let orders = JSON.parse(localStorage.getItem(KEYS.order)) || []
    
    return {
        data: id ? orders.find(order => order.id == id):orders,
        update(data = orders){
            if(data && data.length){
                localStorage.setItem(KEYS.order, JSON.stringify(data))
                return
            }
            localStorage.removeItem(KEYS.order)
        }
    }
}

// dependent utility (getCart & getProduct)
export const getCartItems = async () => {
    let cartItems;

    let { data } = getCart()
    
    for(let pageName in data){
        let {data: products} = await getProduct(null, pageName)
        products = products.filter(product => data[pageName].includes(product.id))
        
        if(products.length){
            if(cartItems == undefined) cartItems = {}
            cartItems[pageName] = products
        }
    }
    return { data: cartItems }
}

export const currency = (value, type = "USD") => {
    return value.toLocaleString('en-US', {
        style: 'currency',
        currency: type,
    })
}
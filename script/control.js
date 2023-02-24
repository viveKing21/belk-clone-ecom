export const KEYS = {
    user: "users",
    loggedIn: "logged_in",
    cart: "cart"
}

export const getUser = (email) => {
    if(window.users == undefined){
        window.users = JSON.parse(localStorage.getItem(KEYS.user)) || []
    }
    return email ? window.users.find(user => user.em == email):window.users
}

export const isLoggedIn = () => {
    if(window.sessionId == undefined){
        let sessionId = localStorage.getItem(KEYS.loggedIn)
        if(sessionId){
            try{
                let user = getUser(atob(sessionId) + "@gmail.com")
                if(user) window.sessionId = sessionId
                else throw "Session Dosen't match";
            }
            catch(e){
                localStorage.removeItem(KEYS.loggedIn)
            }
        }
    }
    return Boolean(window.sessionId)
}

export const getProduct = async (id, pageName) => {
    let path = ''

    if(pageName == null){
        let query = new URLSearchParams(location.search)
        path = `/data/${query.get("page")}.json`;
    }
    else{
        path = `/data/${pageName}.json`;
    }
    
    if(window.products == undefined){
        try{
            let load = await import(path, { assert: { type: "json" }})
            window.products = load.default
        }
        catch(e){
            throw e
        }
    }
    return Promise.resolve(id ? window.products.find(p => p.id == id):window.products)
}

export const getCart = async () => {
    if(window.carts == undefined){
        let carts = JSON.parse(localStorage.getItem(KEYS.cart))
        if(carts) window.carts = carts
    }
    return window.carts
}

export const getCartItems = async () => {
    if(window.cartItems == undefined){
        window.cartItems = {}
        let carts = await getCart()
    
        for(let pageName in carts){
            let products = await getProduct(null, pageName)
            products = products.filter(product => carts[pageName].includes(product.id))
            
            if(products.length){
                window.cartItems[pageName] = products
            }
        }
    }
    return window.cartItems
}

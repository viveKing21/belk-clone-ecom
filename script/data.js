export const KEYS = {
    user: "users"
}

export const getUser = (email) => {
    if(window.users == undefined){
        window.users = JSON.parse(localStorage.getItem(KEYS.user)) || []
    }
    return email ? window.users.find(user => user.em == email):window.users
}
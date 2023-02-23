export const KEYS = {
    user: "users",
    loggedIn: "logged_in"
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
let navigations = document.querySelectorAll(".navigations .nav")
let mainHeader = document.querySelector(".content-container > .header")

// admin title
let FileName = location.pathname.split("/").at(-1)
mainHeader.textContent = FileName.split(".")[0]

// redirection
navigations.forEach(nav => {
    nav.classList.toggle("selected", nav.getAttribute("path") == FileName)
    nav.onclick = () => {
        location = nav.getAttribute("path")
    }
})


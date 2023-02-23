// declaratiopns
let container = document.querySelector(".container");

let expandBtns = document.querySelectorAll(".icon.expand")
let tooltip = document.querySelector(".tooltip-container")

let menuItems = document.querySelectorAll(".menu section ul > li");
let menuContainer = document.querySelector(".menu-container")

let searchInp = document.querySelector(".search_bar > .search")
let searchClear = document.querySelector(".search_bar > #search-clear")
let searchBtn = document.querySelector(".search_bar > #search-btn")

let sliders = document.querySelectorAll(".slider")

let topToPage = document.querySelector(".top")

let dropdown = document.querySelector(".today_offer")
let dropdownBtn = dropdown.querySelector(".today_offer .control")

let sidebar = document.querySelector(".sidebar")
let openBtnSidebar = document.querySelector(".navbar .bar")
let closeBtnSidebar = sidebar.querySelector(".sidebar-container .title .button")
let items = sidebar.querySelectorAll(".sidebar-items > .item")

// search
searchClear.onclick = () => {
    searchInp.value = ""
}
// tooltip 
expandBtns.forEach(btn => {
    let tooltipId = btn.getAttribute("tooltip")
    let tooltipItem = document.querySelector(`.tooltip-${tooltipId}`)

    const setPosition = () => {
        let { x, width } = btn.getBoundingClientRect()
        tooltipItem.style.left = x + width / 2 + "px"
    }

    btn.onclick = () => {
        menuContainer.removeAttribute("show") // close menu
        document.onclick = null
        let currentTooltip = tooltip.getAttribute("show")
        
        if(currentTooltip == tooltipId){
            tooltip.removeAttribute("show")
            removeEventListener('resize', setPosition)
        }
        else{
            setPosition()
            addEventListener('resize', setPosition)

            tooltip.setAttribute("show", tooltipId)

            setTimeout(() => {
                document.onclick = (e) => {
                    if(tooltipItem.contains(e.target)) return
                    tooltip.removeAttribute("show")
                    document.onclick = null
                    removeEventListener('resize', setPosition)
                }
            }, 1)
        }
    }
})

// menu
let timer = null
menuItems.forEach(menuBtn => {
    let menuId = menuBtn.getAttribute("menu")
    menuBtn.onmouseenter = (e) => {
        if(innerWidth <= 1000) return
        clearTimeout(timer)
        menuContainer.setAttribute("show", menuId)
        menuContainer.onmouseleave = menuBtn.onmouseleave = function(){
            timer = setTimeout(() => {
                menuContainer.removeAttribute("show")
            }, 500)
            this.onmouseleave = null
        }
        menuContainer.onmouseenter = () => {
            clearTimeout(timer)
            menuContainer.onmouseenter = null
        }
    }
})

// slider
sliders.forEach(slider => {
    let sliderPrevBtn = slider.querySelector(".previous-btn")
    let sliderNextBtn = slider.querySelector(".next-btn")
    let sliderContent = slider.querySelector(".slider-images")
    let viewPerPage = getComputedStyle(slider).getPropertyValue("--view")
    let sliderItemCount = getComputedStyle(slider).getPropertyValue("--item-count")
    let itemSize = 100 / sliderItemCount
    sliderNextBtn.onclick = () => {
        let viewIndex = +slider.dataset.view || 1
        if(viewIndex > sliderItemCount - viewPerPage) return
        sliderContent.style.setProperty("--transX", itemSize * viewIndex * -1)
        slider.dataset.view = Math.min(viewIndex + 1, sliderItemCount - viewPerPage)
    }
    sliderPrevBtn.onclick = () => {
        let viewIndex = (+slider.dataset.view || 1) - 1
        if(viewIndex < 0) return
        sliderContent.style.setProperty("--transX", (itemSize * viewIndex * -1))
        slider.dataset.view = Math.max(1, viewIndex)
    }

})

// top scroll
container.onscroll = (e) => {
    if(container.scrollTop > 200) {
        topToPage.classList.add("show")
    }
    else{
        topToPage.classList.remove("show")
    }
}
topToPage.onclick = () => container.scrollTo({
    top: 0,
    behavior: "smooth"
})

// dropdown
dropdownBtn.onclick = () => {
    dropdown.classList.toggle("open")
}

// sidebar
items.forEach((item, id) => {
    let itemContainer = item.parentElement

    let btns = Array.from(item.querySelectorAll("div.item-heading:not(.not-expandable) span"))
    if(btns.length == 0) return

    let mainBtn = btns.shift()
    // main btn
    mainBtn.onclick = () => {
        if(itemContainer.dataset.open && itemContainer.dataset.open != id){
            let pvpItem = items[itemContainer.dataset.open].querySelector(".item-heading")
            pvpItem.classList.remove("open")
            pvpItem.querySelector("span").textContent = "add"

            if(items[itemContainer.dataset.open].dataset.open){
                let btns = items[itemContainer.dataset.open].querySelectorAll("div.item-heading:not(.not-expandable) span")
                let btn = btns[+items[itemContainer.dataset.open].dataset.open + 1]
                btn.parentElement.classList.remove("open")
                btn.textContent = "add"
            }
        }
        let pItem = mainBtn.parentElement
        pItem.classList.toggle("open")
        let isOpen = pItem.classList.contains("open")

        if(isOpen == false && item.dataset.open){
            btns[item.dataset.open].parentElement.classList.remove("open")
            btns[item.dataset.open].textContent = "add"
            delete item.dataset.open
        }

        mainBtn.textContent = isOpen ? "remove":"add"
        if(isOpen) itemContainer.dataset.open = id
        else delete itemContainer.dataset.open
    }
    btns.forEach((btn, id_) => {
        let pItem = btn.parentElement
        btn.onclick = () => {
            if(item.dataset.open && item.dataset.open != id_){
                btns[item.dataset.open].parentElement.classList.remove("open")
                btns[item.dataset.open].textContent = "add"
            }
            pItem.classList.toggle("open")
            let isOpen = pItem.classList.contains("open")
            btn.textContent = isOpen ? "remove":"add"
            if(isOpen) item.dataset.open = id_
            else delete item.dataset.open
        }
    })
})

openBtnSidebar.onclick = () => {
    sidebar.classList.add("open")
}
closeBtnSidebar.onclick = () => {
    sidebar.classList.remove("open")
}
sidebar.onclick = (e) => {
    if(e.target === sidebar) closeBtnSidebar.onclick()
}
import { getUser } from "../../script/control.js";

let rowsContainer = document.querySelector(".main-container .rows")

let {data, update} = getUser()


const createTableRow = (details, i) => {
    let row = document.createElement("div")
    let rowId = document.createElement("div")
    let rowContent = document.createElement("div")
    let rowStatus = document.createElement("div")
    let rowDelete = document.createElement("div")

    row.className = "row"
    rowId.className = "row-id"
    rowContent.className = "row-content"
    rowStatus.className = "row-status button"
    rowDelete.className = "row-status button"

    rowId.textContent = (i + 1) + "."
    rowContent.innerHTML = `<b>${details.fn} ${details.ln}</b><i>(${details.em})</i>`;
    rowStatus.innerHTML = `<span style='${details.st == -1 ? 'color:red':''}' class="material-symbols-outlined">block</span>`
    rowDelete.innerHTML = '<span class="material-symbols-outlined">delete</span>'

    rowStatus.onclick = () => {
        details.st *= -1
        rowStatus.innerHTML = `<span style='${details.st == -1 ? 'color:red':''}' class="material-symbols-outlined">block</span>`
        update()
    }
    rowDelete.onclick = () => {
        data.splice(i, 1)
        update()

        if(data.length){
            rowsContainer.innerHTML = ""
            rowsContainer.append(...data.map(createTableRow))
        }
        else{
            rowsContainer.previousElementSibling.hidden = false
            rowsContainer.remove()
        }
    }
    rowStatus.title = "Status"
    rowDelete.title = "Delete"
    row.append(rowId, rowContent, rowStatus, rowDelete)

    return row
}

if(data){
    rowsContainer.append(...data.map(createTableRow))
}
else{
    rowsContainer.previousElementSibling.hidden = false
    rowsContainer.remove()
}
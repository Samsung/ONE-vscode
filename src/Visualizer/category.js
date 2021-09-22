import renderBar from './bar.js'

export default function renderCategory(endTime, digit, title, data){
    const levelContainerList = document.querySelectorAll('.levelContainer')
    const levelContainer = levelContainerList[levelContainerList.length - 1]

    const categoryContainer = document.createElement('section')
    categoryContainer.className = "categoryContainer"

    const categoryHeader = document.createElement('header')
    categoryHeader.className = "categoryHeader"

    const categoryTItle = document.createElement('div')
    categoryTItle.className = "categoryTItle"
    categoryTItle.innerText = title

    const barList = document.createElement('section')
    barList.className = "barList"

    categoryHeader.append(categoryTItle)
    categoryContainer.append(categoryHeader, barList)
    levelContainer.append(categoryContainer)

    data.forEach(element => {
        renderBar(endTime, digit, element)
    });
}
import renderCategory from './category.js'

export default function renderLevel(endTime, digit, title, usage, data) {
    const graph = document.querySelector('.graph')

    const levelContainer = document.createElement('section')
    levelContainer.className = "levelContainer"

    const levelHeader = document.createElement('header')
    levelHeader.className = "levelHeader"
    levelHeader.addEventListener('click', () => {
        levelHeader.classList.toggle("fold")
    })

    const levelTitle = document.createElement('div')
    levelTitle.className = "levelTitle"
    levelTitle.innerText = title

    const utility = document.createElement('span')
    utility.className = "utility"
    utility.innerText = usage < 1 ? ' (' + usage*100 + '%)' : ''
    
    levelTitle.append(utility)
    levelHeader.append(levelTitle)
    levelContainer.append(levelHeader)
    graph.append(levelContainer)

    Object.keys(data).map(key => {
        renderCategory(endTime, digit, key, data[key])             
    })
}
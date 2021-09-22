import openFileSelector from './processData.js'
import onCapture from './capture.js'
import dynamicGraduation from './dynamicGraduation.js'

const loadBtn = document.querySelector('.loadBtn')
loadBtn.addEventListener('click', () => {
    initData()
    openFileSelector()
})

const graph = document.querySelector('.graph')
const html = document.querySelector('html')

const slider = document.querySelector('input')
slider.addEventListener('input', (e) => {
    graph.style.width = `${e.target.value}%`
    if (e.target.max === e.target.value) {
        if (e.target.max === '200') {
            slider.max = '400'
            slider.value = '200'
            slider.min = '100'
        } else if (e.target.max === '400') {
            slider.max = '800'
            slider.value = '400'
            slider.min = '200'
        } else if (e.target.max === '800') {
            slider.max = '1600'
            slider.value = '800'
            slider.min = '400'
        } else if (e.target.max === '1600') {
            slider.max = '3200'
            slider.value = '1600'
            slider.min = '800'
        } else if (e.target.max === '3200') {
            slider.max = '5000'
            slider.value = '3200'
            slider.min = '1600'
        } 
    } else if (e.target.min === e.target.value) {
        if (e.target.min === '100') {
            slider.max = '200'
            slider.value = '100'
            slider.min = '100'
        } else if (e.target.min === '200') {
            slider.max = '400'
            slider.value = '200'
            slider.min = '100'
        } else if (e.target.min === '400') {
            slider.max = '800'
            slider.value = '400'
            slider.min = '200'
        } else if (e.target.min === '800') {
            slider.max = '1600'
            slider.value = '800'
            slider.min = '400'
        } else if (e.target.min === '1600') {
            slider.max = '3200'
            slider.value = '1600'
            slider.min = '800'
        }
    } else {
        return
    }
    slider.disabled = true
    setTimeout(slider.disabled = false , 100)
    dynamicGraduation()
})

const zoomInBtn = document.querySelector('.zoomInBtn')
zoomInBtn.addEventListener('click', () => {
    graph.style.width = `${Math.round(graph.clientWidth/html.clientWidth*100) + 50}%`
    dynamicGraduation()
    zoomInBtn.disabled = true
    setTimeout(() => zoomInBtn.disabled = false , 300)
})

const zoomOutBtn = document.querySelector('.zoomOutBtn')
zoomOutBtn.addEventListener('click', () => {
    if (graph.clientWidth/html.clientWidth*100 <= 100) { 
        graph.style.width = '100%'
        return 
    }
    graph.style.width = `${Math.round(graph.clientWidth/html.clientWidth*100) - 50}%`
    dynamicGraduation()
    zoomOutBtn.disabled = true
    setTimeout(() => zoomOutBtn.disabled = false , 300)
})

const captureBtn = document.querySelector('.captureBtn')
captureBtn.addEventListener('click', () => {
    onCapture()
})

function initData(){
    const graph = document.querySelector('.graph')
    graph.style.width = '100%'
    
    const silder = document.querySelector('input')
    silder.max = "200"
    silder.min = "100"
    silder.value = "100"

    while(graph.hasChildNodes()) {
        graph.removeChild(graph.firstChild);
    }
}

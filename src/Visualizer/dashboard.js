import renderRuler from './ruler.js'
import renderLevel from './level.js'

export default function renderDashboard(utility, endTime, digit, data){
    renderRuler(endTime, digit)
    Object.keys(data).map(key => {
        renderLevel(endTime, digit, key, utility[key], data[key])             
    })
    
}
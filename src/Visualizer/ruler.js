export default function renderRuler(endTime, digit){
    const graph = document.querySelector('.graph')

    const rulerContainer = document.createElement('div')
    rulerContainer.className = "rulerContainer"

    const rulerBlank = document.createElement('div')
    rulerBlank.className = "rulerBlank"

    const ruler = document.createElement('div')
    ruler.className = "ruler"

    rulerContainer.append(rulerBlank, ruler)
    graph.append(rulerContainer)

    mapToRulergraduation(endTime, digit)
}

function mapToRulergraduation(endTime, digit) {
    const ruler = document.querySelector('.ruler')

    for(let i = 0; i < parseInt(endTime / (10 ** (digit - 1))); i++){
        const graduation = document.createElement('div')
        graduation.className = "graduation"
        for (let j = 0; j < 5; j++){
            const smallGraduation = document.createElement('div')
            smallGraduation.className = "smallGraduation"
            if (j === 0) {
                const index = document.createElement('div')
                index.className = "index"
                index.innerText = calculateGraduation(i * (10 ** (digit - 1)))
                smallGraduation.append(index)
            }
            graduation.append(smallGraduation)
        }
        ruler.append(graduation)
    }

}

function calculateGraduation(graduation) {
    if (graduation >= 1000) {
        return Math.round(graduation / 1000 * 10) /10 + 'ms';
    } else if (graduation >= 1) {
        return Math.round(graduation) + 'us';
    } else if (graduation === 0) {
        return 0;
    } else {
        return Math.round(graduation * 1000 * 10) /10 + 'ns';
    }
}
export default function dynamicGraduation() {
    const body = document.querySelector("body");
    const ruler = document.querySelector(".ruler");
    if (!ruler) { return; }
    
    const rulerBlank = document.querySelector(".ruler-blank");
    const graduation = document.querySelector(".ruler .graduation");
    const cnt =  document.querySelectorAll(".ruler .graduation").length;
    const staticRulerWidth = body.clientWidth - rulerBlank.clientWidth;
    const setData = document.querySelector('.set-data');
    const endTime = setData.dataset['endTime'];
    const digit = setData.dataset['digit'];
    const initGraduationCnt = endTime / ( 10 ** (digit - 1));
    const staticGraduationWidth = parseInt(staticRulerWidth / initGraduationCnt);

    if (graduation.offsetWidth < staticGraduationWidth - 3) { 
        removeGraduation(ruler, cnt);
    } else if (graduation.offsetWidth < staticGraduationWidth * 2) {
        return;
    } else {
        addGraduation(ruler, cnt);
    }
    updateGraduation(endTime);
}

function removeGraduation(ruler, cnt){
    for(let i = 0; i < cnt / 2; i++){
        const child = document.querySelector(".ruler .graduation");
        ruler.removeChild(child);
    }
}

function addGraduation(ruler, cnt){
    for(let i = 0; i < cnt; i++){
        const child = document.createElement('div');
        child.className = 'graduation';

        for(let i = 0; i < 5; i++){
            const childOfChild = document.createElement('div');
            childOfChild.className = 'small-graduation';

            if (i === 0) {
                const index = document.createElement('div');
                index.className = 'index';
                childOfChild.append(index);
            }

            child.append(childOfChild);
        }
        ruler.append(child);
    }
}

function updateGraduation(endTime){
    const rulerWidth = document.querySelector(".ruler").scrollWidth;
    const allGraduation = document.querySelectorAll(".ruler .graduation");
    let left = 0;

    allGraduation.forEach(ele => {
        ele.firstChild.firstChild.innerText = calculateGraduation(left / rulerWidth * endTime);
        left += ele.offsetWidth;
    });
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

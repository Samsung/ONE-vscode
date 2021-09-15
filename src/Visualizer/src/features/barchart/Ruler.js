import React, { Component } from 'react';

class Ruler extends Component {
    state = {
        initGraduationCnt : this.props.calculatedEndTime/(10**(this.props.digit-1))
    }

    componentDidUpdate(prevProps) {
        if (this.props.ratio === prevProps.ratio) {
            return
        }

        const body = document.querySelector("body")
        const ruler = document.querySelector(".ruler")
        const rulerBlank = document.querySelector(".ruler-blank")
        const graduation = document.querySelector(".ruler .graduation")
        const cnt =  document.querySelectorAll(".ruler .graduation").length
        const staticRulerWidth = body.clientWidth - rulerBlank.clientWidth
        const staticGraduationWidth = parseInt(staticRulerWidth/this.state.initGraduationCnt)

        if (graduation.offsetWidth < staticGraduationWidth - 3 && this.props.ratio < prevProps.ratio) { 
            this.removeGraduation(ruler, cnt)
        } else if (graduation.offsetWidth < staticGraduationWidth*2) {
            return
        } else {
            this.addGraduation(ruler, cnt)
        }
        this.updateGraduation()
    }

    removeGraduation(ruler, cnt){
        for(let i=0;i<cnt/2;i++){
            const child = document.querySelector(".ruler .graduation")
            ruler.removeChild(child)    
        }
    }

    addGraduation(ruler, cnt){
        for(let i=0;i<cnt;i++){
            const child = document.createElement('div')
            child.className = 'graduation'
            for(let i=0;i<5;i++){
                const childOfChild = document.createElement('div')
                childOfChild.className = 'small-graduation'
                if (i === 0) {
                    const index = document.createElement('div')
                    index.className = 'index'
                    childOfChild.append(index)
                }
                child.append(childOfChild)
            }
            ruler.append(child)    
        }
    }

    updateGraduation(){
        const rulerWidth = document.querySelector(".ruler").scrollWidth
        const allGraduation = document.querySelectorAll(".ruler .graduation")
        let left = 0
        allGraduation.forEach(ele => {
            console.log(left/rulerWidth*this.props.calculatedEndTime)
            ele.firstChild.firstChild.innerText = this.calculateGraduation(left/rulerWidth*this.props.calculatedEndTime)
            left += ele.offsetWidth
        })
    }

    calculateGraduation(graduation) {
        if (graduation >= 1000) {
            return Math.round(graduation/1000*10)/10 + 'ms'
        } else if (graduation >= 1) {
            return Math.round(graduation) + 'us'
        } else if (graduation === 0) {
            return 0
        } else {
            return Math.round(graduation*1000*10)/10 + 'ns'
        }
    }

    render() {
        const mapToRulergraduation = () => { // 줄자 눈금 반복 랜더링
            const result = [];
            for(let i=0; i<parseInt(this.props.calculatedEndTime/(10**(this.props.digit-1))); i++){
                result.push(
                    <div className="graduation" key={i}>
                        <div className="small-graduation"><div className="index">{this.calculateGraduation(i*(10**(this.props.digit-1)))}</div></div>
                        <div className="small-graduation"></div>
                        <div className="small-graduation"></div>
                        <div className="small-graduation"></div>
                        <div className="small-graduation"></div>
                    </div>
                )
            }
            return result
        }

        return (
            <div className="ruler-container">
                <div className="ruler-blank"></div>
                <div className="ruler">
                    {mapToRulergraduation()}
                </div>
            </div>
        );
    }
}

export default Ruler;
import React, { Component } from 'react';
import styled from "styled-components";
import Ruler from "./Ruler";
import Detail from "./Detail";
import Level from "./Level";
import Capture from "./Capture";
import Slider from "./Slider";

const ZoomInOut = styled.div`
    width: ${(props) => props.ratio || 100}%;
`;

class Board extends Component {
    constructor(props) {
        super(props);
        this.handleRulerCntClick = this.handleRulerCntClick.bind(this);
        this.clickBar = this.clickBar.bind(this);
        this.openFileSelector = this.openFileSelector.bind(this);
        this.processFile = this.processFile.bind(this);
        this.processData = this.processData.bind(this);
        this.changeRatio = this.changeRatio.bind(this);
    }

    state = {
        rulerCnt: null,
        ratio: 100,
        selectedOP: null,
        fileName: null,
        data: null,
        calculatedEndTime: null,
        utility: null,
        digit: null,
        displayTimeUnit: null,
        colorList: ['aquamarine', 'cornflowerblue', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan', 'lightgoldenrodyellow', 'lightgreen', 'lightpink', 'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightsteelblue', 'lime', 'limegreen', 'mediumaquamarine', 'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue', 'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'mistyrose', 'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegreen', 'palevioletred', 'paleturquoise', 'peru', 'pink', 'plum', 'powderblue', 'rosybrown', 'thistle', 'yellowgreen', 'firebrick', 'dodgerblue', 'darkorange', 'crimson', 'darkmagenta']
    }

    handleRulerCntClick(value){
        if (this.state.ratio === 100 && value < 0) {
            return
        }
        if (this.state.ratio + value <= 100) {
            this.setState({ratio: 100})
        } else if (this.state.ratio + value >= 5000) {
            this.setState({ratio: 5000})
        } else {
            this.setState({ratio: this.state.ratio + value})
        }
    }

    changeRatio(value){
        this.setState({ratio: value})
    }

    clickBar(info){
        this.setState({selectedOP: info})
    }

    initFIle(){
        this.setState({rulerCnt: null})
        this.setState({ratio: 100})
        this.setState({selectedOP: null})
        this.setState({fileName: null})
        this.setState({data: null})
        this.setState({calculatedEndTime: null})
        this.setState({utility: null})
        this.setState({digit: null})
        this.setState({displayTimeUnit: null})
    }

    openFileSelector(){
        this.initFIle()
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "text/plain";
        input.onchange = (event) => {
            this.setState({fileName: event.target.files[0].name})
            this.processFile(event.target.files[0]);
        };
        input.click();
    }

    processFile(file) {
        const reader = new FileReader();
        reader.onload = () => {
            const data = JSON.parse(reader.result).traceEvents
            this.setState({displayTimeUnit: JSON.parse(reader.result).displayTimeUnit})
            this.processData(data)
        }
        reader.readAsText(file, /* optional */ "euc-kr");
    }

    processData(data) {
        const processedData = {}
        const backgroundColor = {}
        const utility = {}
        let MaxEndTime = 0
        let colorIdx = 0
        const colorLen = this.state.colorList.length
        data.forEach(ele => {
            // init data
            if(!ele.pid) { return }
            processedData[ele.pid] = processedData[ele.pid] ? processedData[ele.pid] : {}
            if (!processedData[ele.pid][ele.tid]) {
                processedData[ele.pid][ele.tid] = []
            }

            // get background color
            if (!backgroundColor[ele.name]) {
                backgroundColor[ele.name] = this.state.colorList[colorIdx]
                colorIdx += 1
                colorIdx %= colorLen
            }
            ele['backgroundColor'] = backgroundColor[ele.name]

            // add data
            processedData[ele.pid][ele.tid].push(ele)
            
            // find time range
            if (ele.ts + ele.dur > MaxEndTime){
                MaxEndTime = ele.ts + ele.dur
            }

            utility[ele.pid] = utility[ele.pid] !== undefined ? utility[ele.pid] + ele.dur : ele.dur
            
        })
        Object.keys(utility).forEach(key => {
            utility[key] = Math.round(utility[key]*100 / MaxEndTime)/100
        })
        this.setState({utility: utility})

        let MaxEndTime_ = MaxEndTime
        let deci = 0
        while (MaxEndTime_ > 0) {
            MaxEndTime_ = parseInt(MaxEndTime_ / 10)
            deci += 1
        }
        
        this.setState({rulerCnt: Math.ceil(MaxEndTime/(10**(deci-1)))*(10**(deci-1))}) // MaxEndTime 올림한 수
        this.setState({calculatedEndTime: Math.ceil(MaxEndTime/(10**(deci-1)))*(10**(deci-1))}) // MaxEndTime 올림한 수
        this.setState({digit: deci}) // MaxEndTime의 자릿수
        this.setState({data: processedData})
    }

    renderLevel() {
        return Object.keys(this.state.data).map((key) => {
            return  <Level 
                        calculatedEndTime={this.state.calculatedEndTime}
                        digit={this.state.digit}
                        processName={key}
                        utility={this.state.utility[key]}
                        data={this.state.data[key]}
                        key={key}
                        rulerCnt={this.state.rulerCnt}
                        clickBar={this.clickBar}/>
        });
    }

    render() {
        return (
        <div className="main-container">
            <nav>
                <div className="file-menu">
                    <Capture/>
                    <button onClick={() => this.openFileSelector()}>Load</button>
                    <div className="file-name"><div>{this.state.fileName}</div></div>
                </div>
                <div className="zoom-menu">
                    <div className="zoom-btns">
                        <button onClick={() => this.handleRulerCntClick(50)}>ZoomIn</button>
                        <button onClick={() => this.handleRulerCntClick(-50)}>ZoomOut</button>
                    </div>
                    <Slider ratio={this.state.ratio} changeRatio={this.changeRatio}/>
                </div>
            </nav>
            <div className="board">
                {this.state.data? 
                    <ZoomInOut ratio={this.state.ratio} className="content">
                        <Ruler
                            ratio={this.state.ratio}
                            calculatedEndTime={this.state.calculatedEndTime}
                            digit={this.state.digit}
                            rulerCnt={this.state.rulerCnt}/>
                        {this.renderLevel()}
                    </ZoomInOut>
                : ''}
            </div>
            <Detail selectedOP={this.state.selectedOP} displayTimeUnit={this.state.displayTimeUnit}/>
        </div>
        );
    }
}

export default Board;
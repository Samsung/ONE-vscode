import React, { Component } from 'react';
import styled from "styled-components";
import Ruler from "./Ruler";
import Detail from "./Detail";
import Level from "./Level";

const ZoomInOut = styled.div`
    width: ${(props) => props.ratio || 100}%;
`;

class Board extends Component {
    constructor(props) {
        super(props);
        this.handleRulerCntClick = this.handleRulerCntClick.bind(this);
        this.handleRulerCntMultipleClick = this.handleRulerCntMultipleClick.bind(this);
        this.clickBar = this.clickBar.bind(this);
        this.openFileSelector = this.openFileSelector.bind(this);
        this.processFile = this.processFile.bind(this);
        this.processData = this.processData.bind(this);
    }

    state = {
        rulerCnt: 6,
        ratio: 100,
        selectedOP: null,
        fileName: null,
        data: null,
        MaxEndTime: null,
        utility: null
    }

    handleRulerCntClick(value){
        this.setState({ratio: this.state.ratio + value})
    }

    handleRulerCntMultipleClick(value){
        this.setState({ratio: this.state.ratio * value})
    }

    clickBar(info){
        this.setState({selectedOP: info})
    }

    openFileSelector(){
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
            this.processData(data)
        }
        reader.readAsText(file, /* optional */ "euc-kr");
    }

    processData(data) {
        const processedData = {}
        const backgroundColor = {}
        const utility = {"CPU Operators": 0, "GPU Operators": 0}
        let MaxEndTime = 0
        const letters = '0123456789ABCDEF';
        data.forEach(ele => {
            // init data
            if(!ele.pid) { return }
            processedData[ele.pid] = processedData[ele.pid] ? processedData[ele.pid] : {}
            if (!processedData[ele.pid][ele.tid]) {
                processedData[ele.pid][ele.tid] = []
            }

            // get background color
            if (!backgroundColor[ele.name]) {
                backgroundColor[ele.name] = "#"
                for (let i = 0; i < 6; i++) {
                    backgroundColor[ele.name] += letters[Math.floor(Math.random() * 16)];
                }
            }
            ele['backgroundColor'] = backgroundColor[ele.name]

            // add data
            processedData[ele.pid][ele.tid].push(ele)
            
            // find time range
            if (ele.ts + ele.dur > MaxEndTime){
                MaxEndTime = ele.ts + ele.dur
            }

            if (ele.pid === "CPU Operators" || ele.pid === "GPU Operators") {
                utility[ele.pid] += ele.dur
            }
        })
        utility["CPU Operators"] = Math.round(utility["CPU Operators"]*100 / MaxEndTime)/100
        utility["GPU Operators"] = Math.round(utility["GPU Operators"]*100 / MaxEndTime)/100
        this.setState({utility: utility})

        MaxEndTime = Math.ceil(MaxEndTime/10000)
        this.setState({rulerCnt: MaxEndTime})

        this.setState({data: processedData})
    }

    renderLevel() {
        return Object.keys(this.state.data).map((key) => {
            return  <Level processName={key} utility={this.state.utility[key]} data={this.state.data[key]} key={key} rulerCnt={this.state.rulerCnt} clickBar={this.clickBar}/>
        });
    }

    render() {
        return (
        <div className="main-container">
            <nav>
                <button>Record</button>
                <button>Save</button>
                <button onClick={() => this.openFileSelector()}>Load</button>
                <div className="file-name"><div>{this.state.fileName}</div></div>
            </nav>
            <div className="board">
                {this.state.data? 
                    <ZoomInOut ratio={this.state.ratio} className="content">
                        <Ruler rulerCnt={this.state.rulerCnt}/>
                        {this.renderLevel()}
                    </ZoomInOut>
                : ''}
            </div>
            <div className="menu-bar">
                Zoom In/Out {this.state.ratio}%
                <button onClick={() => this.handleRulerCntClick(50)}>Zoom In +</button>
                <button onClick={() => this.handleRulerCntClick(-50)}>Zoom Out -</button>
                <button onClick={() => this.handleRulerCntMultipleClick(2)}>Zoom In *2</button>
                <button onClick={() => this.handleRulerCntMultipleClick(0.5)}>Zoom Out /2</button>
            </div>
            <Detail selectedOP={this.state.selectedOP}/>
        </div>
        );
    }
}

export default Board;
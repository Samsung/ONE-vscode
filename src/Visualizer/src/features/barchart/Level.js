import React, { Component } from 'react';
import DataBar from "./DataBar";
import '../../styles/level.css';

class Level extends Component {
    constructor(props) {
        super(props);
        this.handleLevelClick = this.handleLevelClick.bind(this);
    }

    state = {
        isPannelOpen: true,
    }

    handleLevelClick(){
        this.setState({isPannelOpen: !this.state.isPannelOpen})
    }

    renderDataBar() {
        return Object.keys(this.props.data).map((key) => {
            return  <DataBar
                        calculatedEndTime={this.props.calculatedEndTime}
                        digit={this.props.digit}
                        unit={this.props.unit}
                        categoryName={key}
                        data={this.props.data[key]}
                        key={key}
                        rulerCnt={this.props.rulerCnt}
                        clickBar={this.props.clickBar}/>
        });
    }

    render() {
        // const rulerCnt = this.props.rulerCnt
        return (
            <div className="level-container">
                <div className="level-header">
                    <div className="level-title" onClick={this.handleLevelClick}>
                        { this.state.isPannelOpen ? '▶' : '▼' } { this.props.processName } <span className="utility">{this.props.utility < 1 && '(' + this.props.utility*100 + '%)'}</span>
                    </div>
                </div>
                { this.state.isPannelOpen ?
                    <div className="level-content">
                        { this.renderDataBar() }
                    </div>
                : ''}
            </div>
        );
    }
}

export default Level;
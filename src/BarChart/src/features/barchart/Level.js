import React, { Component } from 'react';
import DataBar from "./DataBar";

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
            return  <DataBar categoryName={key} data={this.props.data[key]} key={key} rulerCnt={this.props.rulerCnt} clickBar={this.props.clickBar}/>
        });
    }

    render() {
        // const rulerCnt = this.props.rulerCnt
        return (
            <div className="level-container">
                <header className="level-title" onClick={this.handleLevelClick}>
                    { this.state.isPannelOpen ? '▶' : '▼' } { this.props.processName } <span className="utility">{this.props.utility && '(' + this.props.utility*100 + '%)'}</span>
                </header>
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
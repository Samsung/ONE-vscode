import React, { Component } from 'react';

class Detail extends Component {
    state = {
        timeUnit: {'ms': 10**(-3), 'us': 1, 'ns': 10**3}
    }

    renderArgs(value){
        return Object.keys(value).map((key) => {
            return <div className="arg" key={key}>ㄴ{key} : {value[key]}</div>
        })
    }

    renderDetail() {
        if (this.props.selectedOP) {
            return Object.keys(this.props.selectedOP).map((key) => {
                if (key === 'args') {
                    return  <div className="args" key={key}>{key} {this.renderArgs(this.props.selectedOP[key])}</div>
                } else if (key === 'ts' || key === 'dur') {
                    return  <div key={key}>{key} : {Math.round(this.props.selectedOP[key]*this.state.timeUnit[this.props.displayTimeUnit]*1000)/1000} {this.props.displayTimeUnit} </div>
                } else {
                    return  <div key={key}>{key} : {this.props.selectedOP[key]}</div>
                }
            });
        } else {
            return <div>nothing is selected</div>
        }
    }

    render() {
        return (
            <div className="detail">
                <div className="title"><div>selected stuff</div></div>
                <div className="detail-content">
                    {this.renderDetail()}
                </div>
            </div>
        );
    }
}

export default Detail;
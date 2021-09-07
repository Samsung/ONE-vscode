import React, { Component } from 'react';

class Detail extends Component {
    renderArgs(value){
        return Object.keys(value).map((key) => {
            console.log(key, value[key])
            return <div className="arg" key={key}>ㄴ{key} : {value[key]}</div>
        })
    }

    renderDetail() {
        if (this.props.selectedOP) {
            return Object.keys(this.props.selectedOP).map((key) => {
                if (key === 'args') {
                    return  <div className="args" key={key}>{key} {this.renderArgs(this.props.selectedOP[key])}</div>
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
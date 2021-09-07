import React, { Component } from 'react';
import styled from "styled-components";
import Bar from "./Bar";

// ================= style ======================= //
const StyledBargraduation = styled.div`
    top: 0%;
    left: ${(props) => props.i/props.cnt*100}%; 
    position: absolute;
    height: 100%;
    width: 0.5px;
    background-color: rgb(204, 204, 204);
`;

class DataBar extends Component {
    renderBar() {
        return this.props.data.map((ele) => {
            return  <Bar clickBar={this.props.clickBar} data={ele} cnt={this.props.rulerCnt} key={`${ele.name}-${ele.ts}`}/>
        });
    }

    render() {
        const mapToBarGraduation = () => {
            const result = [];
            for(let i=0; i<this.props.rulerCnt; i++){
                result.push(<StyledBargraduation i={i} cnt={this.props.rulerCnt} key={i}/>)
            }
            return result
        }

        return (
            <div className="data-bar-container">
                <header className="data-bar-title"><div>{ this.props.categoryName }</div></header>
                <div className="data-bar">
                    {this.renderBar()}
                    <div className="graduation">
                        {mapToBarGraduation()}
                    </div>
                </div>
            </div>
        );
    }
}

export default DataBar;
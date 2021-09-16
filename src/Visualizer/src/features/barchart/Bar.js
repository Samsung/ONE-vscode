import React, { Component } from 'react';
import styled from "styled-components";

// ================= style ======================= //
const StyledBar = styled.div`
    position: absolute;
    cursor: pointer;
    text-align: center;
    top: 0%;
    left: ${(props) => props.start/props.calculatedEndTime*100}%;
    height: 100%;
    width: ${(props) => props.duration/props.calculatedEndTime*100}%; 
    z-index: 1;
    background-color: ${(props) => props.backgroundColor};
`;

class Bar extends Component {
    clickBar(e){
        const info = {
            ...this.props.data
        }
        delete info["backgroundColor"]
        if (e.ctrlKey) {
            this.props.clickBar(info, 0)
        } else {
            this.props.clickBar(info, 1)
        }
    }
    
    render() {
        return (
            <StyledBar 
                className="bar"
                calculatedEndTime={this.props.calculatedEndTime}
                digit={this.props.digit}
                onClick={(e) => this.clickBar(e)} 
                start={this.props.data.ts}
                duration={this.props.data.dur}
                name={this.props.data.name}
                backgroundColor={this.props.data.backgroundColor}>
                <div className="bar-title">{this.props.data.name}</div>
            </StyledBar>
        );
    }
}

export default Bar;
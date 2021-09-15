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
    clickBar(){
        const info = {
            ...this.props.data
        }
        delete info["backgroundColor"]
        this.props.clickBar(info)
    }
    
    render() {
        return (
            <StyledBar 
                className="bar"
                calculatedEndTime={this.props.calculatedEndTime}
                digit={this.props.digit}
                onClick={() => this.clickBar()} 
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
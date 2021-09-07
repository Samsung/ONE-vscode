import React, { Component } from 'react';
import styled from "styled-components";

// ================= style ======================= //
const StyledBar = styled.div`
    position: absolute;
    cursor: pointer;
    text-align: center;
    top: 0%;
    left: ${(props) => props.start/props.cnt*10}%;
    height: 100%;
    width: ${(props) => props.duration/props.cnt*10}%; 
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
                onClick={() => this.clickBar()} 
                start={this.props.data.ts/1000} 
                duration={this.props.data.dur/1000} 
                cnt={this.props.cnt}
                name={this.props.data.name}
                backgroundColor={this.props.data.backgroundColor}>
                <div className="bar-title">{this.props.data.name}</div>
            </StyledBar>
        );
    }
}

export default Bar;
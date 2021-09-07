import React, { Component } from 'react';
import styled from "styled-components";

// ================= style ======================= //
const StyledRulergraduation = styled.div`
    position: absolute;
    left: ${(props) => props.i/props.cnt*100}%;
    bottom: 0%;
    width: 0.5px;
    height: ${(props) => props.i%10 === 0? 100 : 25}%;
    background-color: ${(props) => props.i%10 === 0? 'black' : 'gray'};
    &:after {
        content: '${(props) => props.i%10 === 0 && props.i<props.cnt ? props.i+'ms' : ''}';
        margin-left: 3px;
        font-size: 10px;
    }
`;

class Ruler extends Component {
    render() {
        const mapToRulergraduation = () => { // 줄자 눈금 반복 랜더링
            const result = [];
            for(let i=0; i<this.props.rulerCnt*10+1; i++){
                result.push(<StyledRulergraduation i={i} cnt={this.props.rulerCnt*10} key={i}/>)
            }
            return result
        }

        return (
            <div className="ruler-container">
                <div className="ruler-blank"></div>
                <div className="ruler">
                    {mapToRulergraduation()}
                </div>
            </div>
        );
    }
}

export default Ruler;
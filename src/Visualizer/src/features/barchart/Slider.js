import React, { Component } from 'react';
import InputRange from 'react-input-range';
import 'react-input-range/lib/css/index.css';
import '../../styles/slider.css';

class Slider extends Component {
    render() {
        return (
            <div className="slider">
                <span>-</span>
                <InputRange
                    minValue={100}
                    maxValue={5000}
                    step={1}
                    value={this.props.ratio}
                    onChange={value => this.props.changeRatio(value)} />
                <span>+</span>
            </div>
        );
    }
}

export default Slider;
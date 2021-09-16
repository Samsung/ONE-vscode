import React, { Component } from 'react';
import '../../styles/detail.css';

class Detail extends Component {
    state = {
        timeUnit: {'ms': 10**(-3), 'us': 1, 'ns': 10**3}
    }
    renderTds(value) {
        const totals = {
            name: 'totals',
            dur: 0,
            occurrences: 0
        }

        value.forEach((op) => {
            totals.dur += op.dur
            totals.occurrences += op.occurrences
        })

        value.push(totals)
        return value.map((key) => {
            if (key['name'] === 'totals') {
                return <tr className="totals">
                    <td>{key['name']}</td>
                    <td>{Math.round(key['dur']*this.state.timeUnit[this.props.displayTimeUnit]*1000)/1000} {this.props.displayTimeUnit}</td>
                    <td>{Math.round(key['dur']*this.state.timeUnit[this.props.displayTimeUnit]*1000)/1000/key['occurrences']} {this.props.displayTimeUnit}</td>
                    <td>{key['occurrences']}</td>
                </tr>
            } else {
                return <tr>
                    <td>{key['name']}</td>
                    <td>{Math.round(key['dur']*this.state.timeUnit[this.props.displayTimeUnit]*1000)/1000} {this.props.displayTimeUnit}</td>
                    <td>{Math.round(key['dur']*this.state.timeUnit[this.props.displayTimeUnit]*1000)/1000/key['occurrences']} {this.props.displayTimeUnit}</td>
                    <td>{key['occurrences']}</td>
                </tr>
            }
        })
    }
    
    renderArgs(value){
        return Object.keys(value).map((key) => {
            return <div className="arg" key={key}>ㄴ{key} : {value[key]}</div>
        })
    }

    renderSingleContent() {
        return Object.keys(this.props.selectedOP[0]).map((key) => {
            if (key === 'args') {
                return  <div className="args" key={key}>{key} {this.renderArgs(this.props.selectedOP[0][key])}</div>
            } else if (key === 'ts' || key === 'dur') {
                return  <div key={key}>{key} : {Math.round(this.props.selectedOP[0][key]*this.state.timeUnit[this.props.displayTimeUnit]*1000)/1000} {this.props.displayTimeUnit} </div>
            } else {
                return  <div key={key}>{key} : {this.props.selectedOP[0][key]}</div>
            }
        });
    }

    renderMultiContent() {
        const refinedOP = []
        const refinedOP_dict = {}
        let idx = 0

        this.props.selectedOP.forEach(element => {
            const opname = element.name
            const opts = element.ts
            const opdur = element.dur

            const info = {
                name: opname,
                ts: opts,
                dur: opdur,
                occurrences: 1
            }

            if (opname in refinedOP_dict) { 
                const idx = refinedOP_dict[opname]
                refinedOP[idx].dur += info.dur
                refinedOP[idx].occurrences += 1
            } else {
                refinedOP.push(info)
                refinedOP_dict[opname] = idx
                idx += 1
            }
        });

        return (
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>name</th>
                            <th>Wall Duration</th>
                            <th>Average Wall Duration</th>
                            <th>Occurrences</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.renderTds(refinedOP)}
                    </tbody>
                </table>
            </div>
        )
        
    }

    renderDetail() {
        if (this.props.selectedOP.length >= 1) {
            if (this.props.selectedOP.length === 1) {
                return this.renderSingleContent()
            } else {
                return this.renderMultiContent()
            }
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
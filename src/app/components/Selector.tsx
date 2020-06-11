import React, { Component } from 'react';
import SelectorItem from './SelectorItem';

interface SelectorProps {
    datasets: {
        label: string;
        dataset: any;
    }
};

interface State {
    data: any;
    selectedData: any;
};

class Selector extends Component<SelectorProps, State> {
    constructor(props: SelectorProps) {
        super(props)
        this.state = {
            data: this.props.datasets.dataset,
            selectedData: ""
        }
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event: any) {
        const {name, value} = event.target;
        this.setState({
            selectedData: value
        })
        console.log(`Dataset ${value} selected`);
    }

    render() {
        const selectorItems = this.state.data.map((item: any) => <SelectorItem key={item.id} item={item} />)

        return (
            <div>
                <label htmlFor="dataset1"> {this.props.datasets.label} </label>
                <select
                    value={this.state.selectedData}
                    onChange={this.handleChange}
                    id="dataset1"
                    name="selectedData"
                > 
                    <option value="">-- Please, select  a dataset --</option>
                    {selectorItems}
                </select>
            </div>
    
        )
    }
}


export default Selector
import React, { Component } from 'react';
import SelectorItem from './Selector-Item.component';
import { SelectorItemProps } from './Selector-Item.component'

interface SelectorProps {
    datasets: SelectorItemProps[]
};

interface State {
    data: SelectorItemProps[];
    selectedData: string;
};

class Selector extends Component<SelectorProps, State> {
    constructor(props: SelectorProps) {
        super(props)
        this.state = {
            data: this.props.datasets,
            selectedData: ""
        }
    }

    handleChange = (event: React.ChangeEvent<HTMLSelectElement>):void => {
        const {value} = event.target;
        this.setState({
            selectedData: value
        });
    }

    render() {
        const selectorItems = this.state.data.map((item: SelectorItemProps) => <SelectorItem key={item.id} item={item} />)

        return (
            <div>
                <label htmlFor="dataset1"> Datasetes </label>
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
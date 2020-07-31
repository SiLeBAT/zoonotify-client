import React, { Component } from 'react';
import { SelectorItem, SelectorItemProps } from './Selector-Item.component';


interface SelectorProps {
    label: string,
    text: string,
    datasets: SelectorItemProps[]
};

interface State {
    data: SelectorItemProps[];
    selectedData: string;
};

export class Selector extends Component<SelectorProps, State> {
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

    render(): JSX.Element {
        const selectorItems = this.state.data.map((item: SelectorItemProps) => <SelectorItem key={item.id} item={item} />)

        return (
            <div>
                <label htmlFor="dataset1">
                    {this.props.label}
                    <select
                        value={this.state.selectedData}
                        onChange={this.handleChange}
                        id="dataset1"
                        name="selectedData"
                    >
                        <option value="">{this.props.text}</option>
                        {selectorItems}
                    </select>
                </label>
            </div>
        );
    }
}
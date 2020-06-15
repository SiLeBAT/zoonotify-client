import React from 'react';

export interface SelectorItemProps{
    id: number;
    name: string;
}

export function SelectorItem(props: { key: number; item: SelectorItemProps; }): JSX.Element {
    return (
        <option value={props.item.id}> {props.item.name} </option>
    )
}

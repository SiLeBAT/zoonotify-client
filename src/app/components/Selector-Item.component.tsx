import React from 'react';

export interface SelectorItemProps{ id: number; name: string; }

export default function SelectorItem(props: { key: number; item: SelectorItemProps; }) {
    return (
        <option value={props.item.id}> {props.item.name} </option>
    )
}
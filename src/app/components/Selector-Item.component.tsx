import React from 'react';

export default function SelectorItem(props: { key: number; item: { id: number; name: string; }; }) {
    return (
        <option value={props.item.id}> {props.item.name} </option>
    )
}
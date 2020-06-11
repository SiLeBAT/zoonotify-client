import React from 'react';

export default function SelectorItem(props: any) {
    return (
        <option value={props.item.id}> {props.item.name} </option>
    )
}
import React from "react";

export function SelectorItem(props: { item: string }): JSX.Element {
    return <option key={`selector-option-id-${props.item}`} value={props.item}> {props.item} </option>;
}

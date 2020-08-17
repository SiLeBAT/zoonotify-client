import React from "react";

export function SelectorItem(props: { item: string }): JSX.Element {
    return <option value={props.item}> {props.item} </option>;
}

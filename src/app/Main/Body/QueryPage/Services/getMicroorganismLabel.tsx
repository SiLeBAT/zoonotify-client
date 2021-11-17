import React from "react";

export function getMicroorganismLabelService(name: {
    prefix: string;
    name: string;
    italicName: string;
    suffix: string;
}): JSX.Element {
    let microorganismLabel: JSX.Element = <span />;
    if (name.italicName !== "") {
        microorganismLabel = (
            <span>
                {name.prefix}
                <i>{name.italicName}</i>
                {name.suffix}
            </span>
        );
    } else {
        microorganismLabel = (
            <span>
                {name.prefix}
                {name.name}
                {name.suffix}
            </span>
        );
    }
    return microorganismLabel;
}

import React from "react";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

interface ListItemsProps {
    link: string;
    text: string;
}

export function ListContentListItemComponent(props: ListItemsProps): JSX.Element {
    return (
        <ListItem
            button
            component="a"
            target="_blank"
            rel="noreferrer"
            href={props.link}
        >
            <ListItemIcon>
                <OpenInNewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{props.text}</ListItemText>
        </ListItem>
    );
}

import React from "react";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

export interface ListItemProps {
    link: string;
    text: string;
}

/**
 * @desc Returns one ListItem for a link
 * @param props
 * @returns {JSX.Element} - ListItem for the link
 */
export function ListContentListItemComponent(
    props: ListItemProps
): JSX.Element {
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

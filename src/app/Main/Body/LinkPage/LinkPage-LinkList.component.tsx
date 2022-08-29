import React from "react";
import { useTranslation } from "react-i18next";
import { List, ListSubheader } from "@mui/material";
import links from "../../../../assets/external_links.json";
import { LinkListContentComponent } from "./LinkList-ListContent.component";

export function LinkPageLinkListComponent(): JSX.Element[] {
    const { t } = useTranslation(["ExternLinks"]);
    const linkJson = links;
    const elements: JSX.Element[] = [];
    for (const category of linkJson.LinkComponent) {
        elements.push(
            <List
                subheader={
                    <ListSubheader>
                        {t(`${category.Title}.Title`)}
                    </ListSubheader>
                }
                dense
            >
                {LinkListContentComponent(category.Title, category.Links)}
            </List>
        );
    }
    return elements;
}

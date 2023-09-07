import { List, ListSubheader } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import links from "../../../assets/external_links.json";
import { LinkListContentComponent } from "./LinkList-ListContent.component";

export function LinkPageLinkListComponent(): JSX.Element[] {
    const { t } = useTranslation(["ExternLinks"]);
    const linkJson = links;
    const elements: JSX.Element[] = [];
    linkJson.LinkComponent.map((category, index) =>
        elements.push(
            <List
                key={`Title` + index}
                subheader={
                    <ListSubheader>
                        {t(`${category.Title}.Title`)}
                    </ListSubheader>
                }
                dense
            >
                {LinkListContentComponent(category.Title, category.Links)}
            </List>
        )
    );
    return elements;
}

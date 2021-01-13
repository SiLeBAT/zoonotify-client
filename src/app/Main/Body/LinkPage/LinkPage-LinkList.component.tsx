import React from "react";
import { useTranslation } from "react-i18next";
import { List, ListSubheader } from "@material-ui/core";
import links from "../../../../assets/external_links.json";
import { LinkListContentComponent as LinkListContent} from "./LinkList-ListContent.component";

export function LinkPageLinkListComponent(): JSX.Element[] {
    const { t } = useTranslation(["ExternLinks"]);
    const linkJson = links;
    const elements: JSX.Element[] = [];
    linkJson.LinkComponent.forEach((category) => {
        elements.push(
            <List
                subheader={
                    <ListSubheader>
                        {t(`${category.Title}.Title`)}
                    </ListSubheader>
                }
                dense
            >
                {LinkListContent(category.Title, category.Links)}
            </List>
        );
    });
    return elements;
}

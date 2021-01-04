import React from "react";
import { useTranslation } from "react-i18next";
import { ListContentListItemComponent as ListItem} from "./ListContent-ListItem.component";

export function LinkListContentComponent(
    category: string,
    linkList: Record<string, string>[]
): JSX.Element[] {
    const { t } = useTranslation(["ExternLinks"]);
    const elements: JSX.Element[] = [];
    linkList.forEach((linkObject) => {
        elements.push(
            <ListItem
                link={linkObject.Link}
                text={t(`${category}.${linkObject.Text}`)}
            />
        );
    });
    return elements;
}

import React from "react";
import { useTranslation } from "react-i18next";
import { ListContentListItemComponent } from "./ListContent-ListItem.component";

/**
 * @desc Returns ListItems for each link
 * @param category - category of the links to find it in the translation file
 * @param linkList - list of links belonging to one category
 * @returns {JSX.Element[]} - list of ListItems for each link
 */
export function LinkListContentComponent(
    category: string,
    linkList: Record<string, string>[]
): JSX.Element[] {
    const { t } = useTranslation(["ExternLinks"]);
    const elements: JSX.Element[] = [];
    linkList.map((linkObject, index) =>
        elements.push(
            <ListContentListItemComponent
                key={`ListContentListItemComponent` + index}
                link={linkObject.Link}
                text={t(`${category}.${linkObject.Text}`)}
            />
        )
    );
    return elements;
}

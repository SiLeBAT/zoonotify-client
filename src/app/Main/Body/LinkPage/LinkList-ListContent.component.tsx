import React from "react";
import { useTranslation } from "react-i18next";
import { ListContentListItemComponent as ListItem} from "./ListContent-ListItem.component";

/**
 * @desc Returns ListItems for each link
 * @param {string} category - category of the links to find it in the translation file
 * @param {Record<string, string>[]} linkList - list of links belonging to one category
 * @returns {JSX.Element[]} - list of ListItems for each link
 */
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

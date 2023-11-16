import React from "react";
import { useTranslation } from "react-i18next";
import { ListContentListItemComponent } from "./ListContent-ListItem.component";

interface PropsType {
    category: string;
    linkList: Record<string, string>[];
}

export function LinkListContentComponent({
    category,
    linkList,
}: PropsType): JSX.Element[] {
    const { t } = useTranslation(["ExternLinks"]);
    return linkList.map((linkObject, index) => (
        <ListContentListItemComponent
            key={`ListContentListItemComponent` + index}
            link={linkObject.Link}
            text={t(`${category}.${linkObject.Name}`)}
        />
    ));
}

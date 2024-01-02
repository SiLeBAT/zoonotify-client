import { List, ListSubheader } from "@mui/material";
import i18next from "i18next";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { ListContentListItemComponent } from "./ListContent-ListItem.component";
import { EXTERNAL_LINKS } from "../../shared/infrastructure/router/routes";
import { CMSEntity, CMSResponse } from "../../shared/model/CMS.model";

// Define a type for the category
type Category =
    | "LEGAL-REGULATION"
    | "REPORTS"
    | "ORGANIZATION-AND-INSTITUTE"
    | "ONLINE-TOOLS";

interface ExternalLink {
    name: string;
    link: string;
    category: Category;
    priority: number;
}

type ExternalLinkResponse = CMSResponse<
    CMSEntity<ExternalLink>[],
    {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    }
>;

export function LinkPageLinkListComponent(): JSX.Element {
    const { t } = useTranslation(["ExternLinks"]);
    const [linkData, setLinkData] = useState<ExternalLink[]>([]);

    useEffect(() => {
        // Updated the API endpoint to include sorting by priority in descending order
        const apiEndpoint = `${EXTERNAL_LINKS}?locale=${i18next.language}&_sort=priority:DESC`;

        callApiService<ExternalLinkResponse>(apiEndpoint)
            .then((response) => {
                if (response.data && response.data.data) {
                    const extractedLinks = response.data.data.map(
                        (item: CMSEntity<ExternalLink>) => item.attributes
                    );
                    setLinkData(extractedLinks);
                }
                return null;
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
            });
    }, [i18next.language]);

    const groupByCategory = (
        links: ExternalLink[]
    ): Record<Category, ExternalLink[]> => {
        return links.reduce<Record<Category, ExternalLink[]>>((acc, link) => {
            if (!acc[link.category]) acc[link.category] = [];
            acc[link.category].push(link);
            return acc;
        }, {} as Record<Category, ExternalLink[]>);
    };

    const groupedLinks = groupByCategory(linkData);

    return (
        <div>
            {Object.entries(groupedLinks).map(([category, links]) => (
                <List key={category}>
                    <ListSubheader>{t(`${category}`, category)}</ListSubheader>
                    {links.map((link, index) => (
                        <ListContentListItemComponent
                            key={`Link${index}`}
                            link={link.link}
                            text={link.name}
                        />
                    ))}
                </List>
            ))}
        </div>
    );
}

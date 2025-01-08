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
    | "LEGAL_REGULATION"
    | "REPORTS"
    | "ORGANIZATION_AND_INSTITUTES"
    | "ONLINE_TOOLS";
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
        // API endpoint without sorting since we will handle sorting in the frontend
        const apiEndpoint = `${EXTERNAL_LINKS}?locale=${i18next.language}`;

        callApiService<ExternalLinkResponse>(apiEndpoint)
            .then((response) => {
                console.log("API Response:", response.data);
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
        const grouped = links.reduce<Record<Category, ExternalLink[]>>(
            (acc, link) => {
                if (!acc[link.category]) acc[link.category] = [];
                acc[link.category].push(link);
                return acc;
            },
            {} as Record<Category, ExternalLink[]>
        );

        return grouped;
    };

    const groupedLinks = groupByCategory(linkData);

    const categoryOrder: Category[] = [
        "ONLINE_TOOLS",
        "REPORTS",
        "ORGANIZATION_AND_INSTITUTES",
        "LEGAL_REGULATION",
    ];

    return (
        <div>
            {categoryOrder.map((category) => {
                const linksForCategory = groupedLinks[category];

                if (!linksForCategory || linksForCategory.length === 0) {
                    return null;
                }

                const sortedLinks = linksForCategory
                    .slice()
                    .sort((a, b) => b.priority - a.priority);

                return (
                    <List key={category}>
                        <ListSubheader>
                            {t(`${category}`, category)}
                        </ListSubheader>
                        {sortedLinks.map((link, index) => (
                            <ListContentListItemComponent
                                key={`Link${index}`}
                                link={link.link}
                                text={link.name}
                            />
                        ))}
                    </List>
                );
            })}
        </div>
    );
}

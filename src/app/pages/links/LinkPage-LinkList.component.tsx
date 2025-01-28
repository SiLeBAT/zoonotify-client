import React, { useEffect, useState } from "react";
import { List, ListItem, ListSubheader } from "@mui/material";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import Markdown from "markdown-to-jsx";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { EXTERNAL_LINKS } from "../../shared/infrastructure/router/routes";
import { CMSEntity, CMSResponse } from "../../shared/model/CMS.model";

type Category =
    | "LEGAL_REGULATION"
    | "REPORTS"
    | "ORGANIZATION_AND_INSTITUTES"
    | "ONLINE_TOOLS";

interface ExternalLink {
    category: Category;
    content: string; // Markdown content directly
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
        const apiEndpoint = `${EXTERNAL_LINKS}?locale=${i18next.language}`;
        console.log("[LinkPageLinkList] Fetching from:", apiEndpoint);

        callApiService<ExternalLinkResponse>(apiEndpoint)
            .then((response) => {
                console.log("[LinkPageLinkList] Raw response:", response);

                if (response?.data?.data) {
                    const extractedLinks = response.data.data.map(
                        (item: CMSEntity<ExternalLink>) => item.attributes
                    );
                    console.log(
                        "[LinkPageLinkList] extractedLinks:",
                        extractedLinks
                    );
                    setLinkData(extractedLinks);
                } else {
                    console.warn("[LinkPageLinkList] No data in response");
                }

                // Return something to satisfy `promise/always-return`
                return response;
            })
            .catch((err) => {
                console.error("[LinkPageLinkList] Error fetching data:", err);
                // You can choose to re-throw the error if you want
                throw err;
            });
    }, [i18next.language]);

    // Explicitly specify the return type here
    function groupByCategory(
        links: ExternalLink[]
    ): Record<Category, ExternalLink[]> {
        return links.reduce<Record<Category, ExternalLink[]>>((acc, link) => {
            if (!acc[link.category]) {
                acc[link.category] = [];
            }
            acc[link.category].push(link);
            return acc;
        }, {} as Record<Category, ExternalLink[]>);
    }

    const groupedLinks = groupByCategory(linkData);
    console.log("[LinkPageLinkList] groupedLinks:", groupedLinks);

    const categoryOrder: Category[] = [
        "ONLINE_TOOLS",
        "REPORTS",
        "ORGANIZATION_AND_INSTITUTES",
        "LEGAL_REGULATION",
    ];

    return (
        <div>
            {categoryOrder.map((category) => {
                const itemsForCategory = groupedLinks[category];
                if (!itemsForCategory || itemsForCategory.length === 0) {
                    console.log(
                        `[LinkPageLinkList] No items for category: "${category}"`
                    );
                    return null;
                }

                const categoryLabel = t(category, { defaultValue: category });
                console.log(
                    `[LinkPageLinkList] t(${category}):`,
                    categoryLabel
                );

                return (
                    <List key={category}>
                        <ListSubheader>{categoryLabel}</ListSubheader>

                        {itemsForCategory.map((item, idx) => {
                            console.log(
                                `[LinkPageLinkList] Rendering item #${idx}`,
                                item
                            );

                            return (
                                <ListItem key={idx}>
                                    {/* Render content using the Markdown component */}
                                    <Markdown>{item.content}</Markdown>
                                </ListItem>
                            );
                        })}
                    </List>
                );
            })}
        </div>
    );
}

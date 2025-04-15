import React, { useEffect, useState } from "react";
import { List, ListItem, ListSubheader } from "@mui/material";
//import i18next from "i18next";
import { useTranslation } from "react-i18next";
import Markdown from "markdown-to-jsx";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { EXTERNAL_LINKS } from "../../shared/infrastructure/router/routes";

type Category =
    | "LEGAL_REGULATION"
    | "REPORTS"
    | "ORGANIZATION_AND_INSTITUTES"
    | "ONLINE_TOOLS";

interface ExternalLink {
    id: number;
    category: Category;
    content: string | null;
}

interface ExternalLinkResponse {
    data: ExternalLink[];
    meta: {
        pagination: {
            page: number;
            pageSize: number;
            pageCount: number;
            total: number;
        };
    };
}

export function LinkPageLinkListComponent(): JSX.Element {
    const { t, i18n } = useTranslation(["ExternLinks"]);
    const [linkData, setLinkData] = useState<ExternalLink[]>([]);

    // Update the browser URL to always include the current language as a query parameter.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("lang") !== i18n.language) {
            params.set("lang", i18n.language);
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            window.history.replaceState({}, "", newUrl);
        }
    }, [i18n.language]);

    useEffect(() => {
        const apiEndpoint = `${EXTERNAL_LINKS}?locale=${i18n.language}`;
        console.log("[LinkPageLinkList] Fetching from:", apiEndpoint);

        callApiService<ExternalLinkResponse>(apiEndpoint)
            .then((response) => {
                console.log("[LinkPageLinkList] Raw response:", response);
                if (response?.data?.data) {
                    setLinkData(response.data.data);
                } else {
                    console.warn("[LinkPageLinkList] No data in response");
                }
                return response;
            })
            .catch((err) => {
                console.error("[LinkPageLinkList] Error fetching data:", err);
            });
    }, [i18n.language]);

    // Group links by category
    function groupByCategory(
        links: ExternalLink[]
    ): Record<Category, ExternalLink[]> {
        return links.reduce((acc, link) => {
            if (!acc[link.category]) {
                acc[link.category] = [];
            }
            acc[link.category].push(link);
            return acc;
        }, {} as Record<Category, ExternalLink[]>);
    }

    const groupedLinks = groupByCategory(linkData);

    // Specify category order
    const categoryOrder: Category[] = [
        "ONLINE_TOOLS",
        "REPORTS",
        "ORGANIZATION_AND_INSTITUTES",
        "LEGAL_REGULATION",
    ];

    return (
        <div>
            {categoryOrder.map((category) => {
                // Filter out items that don't have non-empty content.
                const itemsForCategory = (groupedLinks[category] || []).filter(
                    (item) => item.content && item.content.trim() !== ""
                );

                // Only render the category if there is at least one valid item.
                if (itemsForCategory.length === 0) {
                    return null;
                }

                const categoryLabel = t(category, { defaultValue: category });
                console.log(
                    `[LinkPageLinkList] Rendering category: "${categoryLabel}"`
                );

                return (
                    <List key={category}>
                        <ListSubheader>{categoryLabel}</ListSubheader>
                        {itemsForCategory.map((item) => {
                            console.log(
                                "[LinkPageLinkList] Rendering item:",
                                item
                            );
                            return (
                                <ListItem key={item.id}>
                                    <Markdown
                                        options={{
                                            overrides: {
                                                a: {
                                                    props: {
                                                        target: "_blank",
                                                        rel: "noopener noreferrer",
                                                    },
                                                },
                                            },
                                        }}
                                    >
                                        {item.content ?? ""}
                                    </Markdown>
                                </ListItem>
                            );
                        })}
                    </List>
                );
            })}
        </div>
    );
}

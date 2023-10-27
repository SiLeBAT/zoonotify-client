import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { List, ListSubheader } from "@mui/material";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { ListContentListItemComponent } from "./ListContent-ListItem.component";

// Import CMSResponse and CMSEntity
import { CMSResponse, CMSEntity } from "../../shared/model/CMS.model";

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
    ordernumber: number;
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
        // Updated the API endpoint to include sorting by ordernumber in descending order
        const apiEndpoint =
            "http://localhost:1337/api/externallinks?_sort=ordernumber:DESC";

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
    }, []);

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
                    <ListSubheader>
                        {t(`${category}.Title`, category)}
                    </ListSubheader>
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

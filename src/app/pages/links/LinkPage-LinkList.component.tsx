import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { List, ListSubheader } from "@mui/material";
import axios from "axios";
import { ListContentListItemComponent } from "./ListContent-ListItem.component";

interface ExternalLink {
    Name: string;
    Link: string;
    category:
        | "legal regulation"
        | "Reports"
        | "Organizations and Institutes"
        | "Online Tools";
}

interface ApiData {
    id: number;
    attributes: ExternalLink;
}

interface ApiResponse {
    data: ApiData[];
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
    const { t } = useTranslation(["ExternLinks"]);
    const [linkData, setLinkData] = useState<ExternalLink[]>([]);

    useEffect(() => {
        const apiEndpoint = "http://localhost:1337/api/externallinks";
        axios
            .get<ApiResponse>(apiEndpoint)
            .then((response) => {
                const extractedLinks = response.data.data.map(
                    (item) => item.attributes
                );
                setLinkData(extractedLinks);
                return null; // Added this line to resolve linting error.
            })
            .catch((error) => {
                console.error("Error fetching data: ", error);
            });
    }, []);

    // Function to group the links by their category
    const groupByCategory = (
        links: ExternalLink[]
    ): Record<string, ExternalLink[]> => {
        return links.reduce<Record<string, ExternalLink[]>>((acc, link) => {
            if (!acc[link.category]) acc[link.category] = [];
            acc[link.category].push(link);
            return acc;
        }, {});
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
                            link={link.Link}
                            text={link.Name}
                        />
                    ))}
                </List>
            ))}
        </div>
    );
}

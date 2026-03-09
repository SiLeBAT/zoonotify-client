import React, { useEffect, useState } from "react";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";
import Markdown from "markdown-to-jsx";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { DATA_PROTECTION } from "./../../shared/infrastructure/router/routes";
import {
    ApiResponse,
    callApiService,
} from "../../shared/infrastructure/api/callApi.service";

interface DataProtectionAttributes {
    subheading: string;
    content: string;
}

export function DataProtectionPageComponent(): JSX.Element {
    const [dataProtectionInfo, setDataProtectionInfo] =
        useState<DataProtectionAttributes | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { t, i18n } = useTranslation(["DataProtection"]);

    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const response: ApiResponse<any> = await callApiService(
                    `${DATA_PROTECTION}?locale=${i18n.language}`
                );

                // Strapi v5 flat structure: data.data.field (no .attributes wrapper)
                if (
                    response.data &&
                    response.data.data &&
                    response.data.data.content
                ) {
                    setDataProtectionInfo({
                        subheading: response.data.data.subheading,
                        content: response.data.data.content,
                    });
                    setError(null);
                } else {
                    console.warn(
                        "Data protection content not found in API response (Strapi v5 structure)."
                    );
                    setError(t("errorLoadingData"));
                }
            } catch (err) {
                console.error("Error fetching data protection info:", err);
                setError(t("errorLoadingData"));
            }
        };

        fetchData();
    }, [i18n.language, t]);

    if (error) {
        return <Typography>{error}</Typography>;
    }

    if (!dataProtectionInfo) {
        return <Typography>{t("Loading")}</Typography>;
    }

    const title = t("Heading");

    return (
        <PageLayoutComponent>
            <div
                style={{ overflowY: "auto", maxHeight: "calc(100vh - 100px)" }}
            >
                <LogoCardComponent
                    title={title}
                    subtitle={dataProtectionInfo.subheading}
                    text={<Markdown>{dataProtectionInfo.content}</Markdown>}
                />
            </div>
        </PageLayoutComponent>
    );
}

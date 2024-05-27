import React, { useEffect, useState } from "react";
import { PageLayoutComponent } from "../../shared/components/layout/PageLayoutComponent";
import { LogoCardComponent } from "../../shared/components/logo_card/LogoCard.component";
import Markdown from "markdown-to-jsx";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { DATA_PROTECTION } from "./../../shared/infrastructure/router/routes";

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
                // Append the locale parameter to the fetch URL to request localized data
                const response = await fetch(
                    `${DATA_PROTECTION}?locale=${i18n.language}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const attributes = data.data
                    .attributes as DataProtectionAttributes;
                if (attributes) {
                    setDataProtectionInfo(attributes);
                    setError(null);
                }
            } catch (err) {
                console.error(err);
                setError(t("unknownError"));
            }
        };

        fetchData();
    }, [i18n.language]);

    if (error) {
        return <Typography>{t("errorLoadingData")}</Typography>;
    }

    if (!dataProtectionInfo) {
        return <Typography>{t("unknownError")}</Typography>;
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

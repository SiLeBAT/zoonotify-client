import { WELCOME } from "./../../shared/infrastructure/router/routes";
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { UseCase } from "../../shared/model/UseCases";

interface WelcomeDTO {
    id: number;
    subheading: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    locale: string;
}

interface WelcomeResponse {
    data: WelcomeDTO;
    meta: unknown; // Or more specific if you want
}

// Types for your local usage
export type WelcomePageModel = {
    title: string;
    subtitle: string;
    content: string;
};

export type WelcomePageOperations = Record<string, never>;

export type WelcomePageTranslations = {
    hardCodedSubtitle: string;
    hardCodedContent: string;
};

function getTranslations(t: TFunction): WelcomePageTranslations {
    // Provide default fallback if translations are missing
    const hardCodedSubtitle = t("Subtitle") || "Default Subtitle";
    const hardCodedContent = t("MainText") || "Default Main Text";
    return { hardCodedSubtitle, hardCodedContent };
}

// 2) Implement the hook with the new interface
const useWelcomePageComponent: UseCase<
    null,
    WelcomePageModel,
    WelcomePageOperations
> = () => {
    const { t } = useTranslation(["HomePage"]);
    const { hardCodedSubtitle, hardCodedContent } = getTranslations(t);

    const [subtitle, setSubtitle] = useState<string>(hardCodedSubtitle);
    const [content, setContent] = useState<string>(hardCodedContent);

    useEffect(() => {
        const url = `${WELCOME}?locale=${i18next.language}`;
        console.log("Fetching welcome page data from:", url);

        // 3) Use the new interface in the API call
        callApiService<WelcomeResponse>(url)
            .then((response) => {
                console.log("Received API response:", response);
                if (response.data && response.data.data) {
                    const { subheading, content: apiContent } =
                        response.data.data;
                    // Update state using API data or fall back to hard-coded defaults
                    setSubtitle(subheading || hardCodedSubtitle);
                    setContent(apiContent || hardCodedContent);
                } else {
                    console.warn(
                        "API response data is missing expected fields."
                    );
                }
                return response; // Return the response to satisfy the promise/always-return rule.
            })
            .catch((error) => {
                console.error("Error fetching welcome page data:", error);
                // Optionally, display an error message in the UI
            });
    }, [hardCodedContent, hardCodedSubtitle, t]);

    const title = "ZooNotify";

    return {
        model: {
            title,
            subtitle,
            content,
        },
        operations: {},
    };
};

export { useWelcomePageComponent };

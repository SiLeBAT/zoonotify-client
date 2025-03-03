import { WELCOME } from "./../../shared/infrastructure/router/routes";
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
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
    meta: unknown;
}

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
    const hardCodedSubtitle = t("Subtitle") || "Default Subtitle";
    const hardCodedContent = t("MainText") || "Default Main Text";
    return { hardCodedSubtitle, hardCodedContent };
}

const useWelcomePageComponent: UseCase<
    null,
    WelcomePageModel,
    WelcomePageOperations
> = () => {
    const { t } = useTranslation(["HomePage"]);
    const { hardCodedSubtitle, hardCodedContent } = getTranslations(t);
    const location = useLocation();
    const history = useHistory();

    const [subtitle, setSubtitle] = useState<string>(hardCodedSubtitle);
    const [content, setContent] = useState<string>(hardCodedContent);

    // Effect to ensure the URL always includes the locale query parameter
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const localeParam = params.get("locale");

        // If no locale is present, set it based on the current i18next language
        if (!localeParam) {
            params.set("locale", i18next.language);
            history.replace({ search: params.toString() });
        } else if (localeParam !== i18next.language) {
            // If the URL locale differs from i18next's current language, update it
            i18next.changeLanguage(localeParam);
        }
    }, [location.search, history]);

    useEffect(() => {
        // Build the API URL using the current i18next language
        const url = `${WELCOME}?locale=${i18next.language}`;
        console.log("Fetching welcome page data from:", url);

        callApiService<WelcomeResponse>(url)
            .then((response) => {
                console.log("Received API response:", response);
                if (response.data && response.data.data) {
                    const { subheading, content: apiContent } =
                        response.data.data;
                    setSubtitle(subheading || hardCodedSubtitle);
                    setContent(apiContent || hardCodedContent);
                } else {
                    console.warn(
                        "API response data is missing expected fields."
                    );
                }
                return response;
            })
            .catch((error) => {
                console.error("Error fetching welcome page data:", error);
            });
    }, [hardCodedContent, hardCodedSubtitle, t, i18next.language]);

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

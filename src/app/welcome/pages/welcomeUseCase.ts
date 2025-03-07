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

    // Effect 1: Update i18next if the URL has a different locale
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const localeParam = params.get("locale");
        if (localeParam && localeParam !== i18next.language) {
            i18next.changeLanguage(localeParam);
        }
    }, [location.search]);

    // Effect 2: Update the URL when i18next language changes
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("locale") !== i18next.language) {
            params.set("locale", i18next.language);
            history.replace({ search: params.toString() });
        }
    }, [i18next.language, location.search, history]);

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

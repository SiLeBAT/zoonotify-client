import { WELCOME } from "./../../shared/infrastructure/router/routes";
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSEntity, CMSResponse } from "../../shared/model/CMS.model";
import { UseCase } from "../../shared/model/UseCases";
import { WelcomeAttributesDTO } from "../model/Welcome.model";

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
    // Use defaults if the translation keys are missing.
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

    const [subtitle, setSubtitle] = useState<string>(hardCodedSubtitle);
    const [content, setContent] = useState<string>(hardCodedContent);

    useEffect(() => {
        const url = `${WELCOME}?locale=${i18next.language}`;
        console.log("Fetching welcome page data from:", url);

        callApiService<CMSResponse<CMSEntity<WelcomeAttributesDTO>, unknown>>(
            url
        )
            .then((response) => {
                console.log("Received API response:", response);
                if (
                    response.data &&
                    response.data.data &&
                    response.data.data.attributes
                ) {
                    const { subheading, content: apiContent } =
                        response.data.data.attributes;
                    // Update state using API data or fall back to hard-coded defaults.
                    setSubtitle(subheading || hardCodedSubtitle);
                    setContent(apiContent || hardCodedContent);
                } else {
                    console.warn(
                        "API response data is missing expected attributes."
                    );
                }
                return response;
            })
            .catch((error) => {
                console.error("Error fetching welcome page data:", error);
                // Optionally, you can update state to display an error message.
            });
    }, [i18next.language, hardCodedSubtitle, hardCodedContent]);

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

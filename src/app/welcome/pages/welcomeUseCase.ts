import { WELCOME } from "./../../shared/infrastructure/router/routes";
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSEntity, CMSResponse } from "../../shared/model/CMS.model";
import { UseCase } from "../../shared/model/UseCases";
import { WelcomeAttributesDTO } from "../model/Welcome.model";

type WelcomePageModel = {
    title: string;
    subtitle: string;
    content: string;
};

type WelcomePageOperations = Record<string, never>;

type WelcomePageTranslations = {
    hardCodedSubtitle: string;
    hardCodedContent: string;
};

function getTranslations(t: TFunction): WelcomePageTranslations {
    const hardCodedSubtitle = t("Subtitle");
    const hardCodedContent = t("MainText");
    return { hardCodedSubtitle, hardCodedContent };
}

const useWelcomePageComponent: UseCase<
    null,
    WelcomePageModel,
    WelcomePageOperations
> = () => {
    const { t } = useTranslation(["HomePage"]);

    const { hardCodedSubtitle, hardCodedContent } = getTranslations(t);

    const [subtitle, setSubtitle] = useState(hardCodedSubtitle);

    const [content, setContent] = useState(hardCodedContent);

    useEffect(() => {
        callApiService<CMSResponse<CMSEntity<WelcomeAttributesDTO>, unknown>>(
            `${WELCOME}?locale=${i18next.language}`
        )
            .then((response) => {
                if (response.data) {
                    const data = response.data.data;
                    setSubtitle(data.attributes.subheading);
                    setContent(data.attributes.content);
                }
                return response;
            })
            .catch((error) => {
                throw error;
            });
    }, [i18next.language]);

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

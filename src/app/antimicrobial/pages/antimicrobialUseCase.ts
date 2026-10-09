import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { AMU_PAGE } from "../../shared/infrastructure/router/routes";
import { UseCase } from "../../shared/model/UseCases";

interface AntimicrobialDTO {
    id: number;
    title: string;
    description: string; // Changed from Block[] to string for Markdown
    locale: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

interface AntimicrobialResponse {
    data: AntimicrobialDTO;
    meta: unknown;
}

export type AntimicrobialPageModel = {
    title: string;
    description: string;
};

export type AntimicrobialPageOperations = Record<string, never>;

export const useAntimicrobialPageComponent: UseCase<
    null,
    AntimicrobialPageModel,
    AntimicrobialPageOperations
> = () => {
    const { t } = useTranslation(["HomePage"]);
    const hardCodedTitle = t("AntimicrobialTitle") || "";
    const hardCodedDescription = t("AntimicrobialDescription") || "";

    const [title, setTitle] = useState<string>(hardCodedTitle);
    const [description, setDescription] =
        useState<string>(hardCodedDescription);

    // Language <-> URL sync is useLanguageUrlSync's job, mounted once in
    // Body-Router.component.tsx.

    // fetch + parse with async/await
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            const url = `${AMU_PAGE}?locale=${i18next.language}`;

            try {
                const resp = await callApiService<AntimicrobialResponse>(url);
                const amuTitle = resp.data?.data.title || "";
                const amuDescription = resp.data?.data.description || "";

                setTitle(amuTitle || hardCodedTitle);
                setDescription(amuDescription || hardCodedDescription);
            } catch (err) {
                console.error("Antimicrobial fetch error:", err);
            }
        };

        fetchData();
    }, [hardCodedTitle, hardCodedDescription, i18next.language]);

    return {
        model: { title, description },
        operations: {},
    };
};

// src/app/microbial_counts/pages/microbialCountsUseCase.ts
import i18next from "i18next";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { MICROBIAL_COUNTS } from "../../shared/infrastructure/router/routes";
import { UseCase } from "../../shared/model/UseCases";

interface MicrobialCountDTO {
    id: number;
    title?: string;
    description: string; // richtext/HTML or markdown string
    locale: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

interface MicrobialCountsResponse {
    data: MicrobialCountDTO[];
    meta: unknown;
}

export type MicrobialCountsPageModel = {
    title: string;
    description: string;
};

export type MicrobialCountsPageOperations = Record<string, never>;

export const useMicrobialCountsPageComponent: UseCase<
    null,
    MicrobialCountsPageModel,
    MicrobialCountsPageOperations
> = () => {
    const { t } = useTranslation(["HomePage"]);
    const hardCodedTitle = t("MicrobialCountsTitle") || "Microbial counts";
    const hardCodedDescription =
        t("MicrobialCountsDescription") || "No content available yet.";

    const location = useLocation();
    const history = useHistory();

    const [title, setTitle] = useState<string>(hardCodedTitle);
    const [description, setDescription] =
        useState<string>(hardCodedDescription);

    // URL -> i18next
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const localeParam = params.get("locale");
        if (localeParam && localeParam !== i18next.language) {
            i18next.changeLanguage(localeParam);
        }
    }, [location.search]);

    // i18next -> URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("locale") !== i18next.language) {
            params.set("locale", i18next.language);
            history.replace({ search: params.toString() });
        }
    }, [i18next.language, location.search, history]);

    // fetch content
    useEffect(() => {
        const fetchData = async (): Promise<void> => {
            const url = `${MICROBIAL_COUNTS}?locale=${i18next.language}&sort=publishedAt:desc`;

            try {
                const resp = await callApiService<MicrobialCountsResponse>(url);
                const items = resp.data?.data ?? [];
                if (items.length === 0) return;

                // take the newest (sorted desc)
                const first = items[0];
                setTitle(first.title || hardCodedTitle);
                setDescription(first.description || hardCodedDescription);
            } catch (err) {
                console.error("MicrobialCounts fetch error:", err);
            }
        };

        fetchData();
    }, [hardCodedTitle, hardCodedDescription, i18next.language]);

    return {
        model: { title, description },
        operations: {},
    };
};

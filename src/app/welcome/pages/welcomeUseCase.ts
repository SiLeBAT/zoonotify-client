import { WELCOME } from "./../../shared/infrastructure/router/routes";
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { UseCase } from "../../shared/model/UseCases";

interface WelcomeDTO {
    id?: number;
    subheading?: string | null;
    content?: string | null;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
    locale?: string;
}

// Some backends wrap the data differently. Make the type flexible.
type WelcomeResponse =
    | { data?: WelcomeDTO | null; meta?: unknown }
    | { data?: { data?: WelcomeDTO | null } };

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
    // If your i18n keys don't exist, provide safe defaults.
    const hardCodedSubtitle = t("Subtitle") || "Default Subtitle";
    const hardCodedContent = t("MainText") || "Default Main Text";
    return { hardCodedSubtitle, hardCodedContent };
}

const useWelcomePageComponent: UseCase<
    null,
    WelcomePageModel,
    WelcomePageOperations
> = () => {
    const { t, i18n } = useTranslation(["HomePage"]);
    const { hardCodedSubtitle, hardCodedContent } = useMemo(
        () => getTranslations(t),
        // only recompute when language/namespace actually changes
        [i18n.language]
    );

    const location = useLocation();
    const history = useHistory();

    // Start empty to avoid flashing the hard-coded text.
    const [subtitle, setSubtitle] = useState<string>("");
    const [content, setContent] = useState<string>("");

    // Keep a flag to know if we've tried the CMS already.
    const fetchedRef = useRef(false);

    // Effect 1: if URL has ?locale=xyz and it's different, switch i18n.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const localeParam = params.get("locale");
        if (localeParam && localeParam !== i18next.language) {
            i18next.changeLanguage(localeParam);
        }
    }, [location.search]);

    // Effect 2: reflect current i18n language back to the URL.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("locale") !== i18next.language) {
            params.set("locale", i18next.language);
            history.replace({ search: params.toString() });
        }
    }, [i18next.language, location.search, history]);

    // Effect 3: fetch from CMS; if empty or error, fall back to hard-coded.
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        fetchedRef.current = false;

        async function run(): Promise<void> {
            const url = `${WELCOME}?locale=${i18next.language}`;
            try {
                const response = await callApiService<WelcomeResponse>(url, {
                    signal,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } as any);

                // Handle both shapes: { data: WelcomeDTO } OR { data: { data: WelcomeDTO } }
                const maybeWrapped =
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (response as any)?.data &&
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (response as any).data.data !== undefined
                        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (response as any).data.data
                        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          (response as any)?.data;

                const dto: WelcomeDTO | null | undefined = maybeWrapped;

                const cmsSubtitle = dto?.subheading?.trim() || "";
                const cmsContent = dto?.content?.trim() || "";

                if (cmsSubtitle || cmsContent) {
                    setSubtitle(cmsSubtitle);
                    setContent(cmsContent);
                } else {
                    // CMS responded but with empty fields -> fall back
                    setSubtitle(hardCodedSubtitle);
                    setContent(hardCodedContent);
                }
            } catch (err) {
                if (!signal.aborted) {
                    // Error fetching -> fall back
                    setSubtitle(hardCodedSubtitle);
                    setContent(hardCodedContent);
                }
            } finally {
                fetchedRef.current = true;
            }
        }

        run();

        return () => controller.abort();
        // Re-fetch when language changes or hard-coded fallbacks change.
    }, [i18next.language, hardCodedSubtitle, hardCodedContent]);

    // Title can be static or translated if you prefer: t('TitleKey') ?? 'ZooNotify'
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

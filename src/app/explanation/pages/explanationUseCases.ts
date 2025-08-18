// useExplanationPageComponent.ts
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import * as lodash from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useHistory } from "react-router-dom";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { EXPLANATION } from "../../shared/infrastructure/router/routes";
import { UseCase } from "../../shared/model/UseCases";
import { slugify } from "../components/utils/slugify";

import {
    ExplanationAPIResponse,
    ExplanationItem,
    ExplanationCollection,
    ExplanationDTO,
    AMRTablesDTO,
} from "../model/ExplanationPage.model";

type ExplanationPageModel = {
    explanationCollection: ExplanationCollection;
    mainSection: ExplanationDTO[];
    title: string;
    amrData: AMRTablesDTO[];
    openAmrDialog: boolean;
    currentAMRID: string;
    deepLink: string;
    // NEW ↓↓↓
    activeAnchor: string | null;
};

type ExplanationPageOperations = {
    handleOpen: (id: string) => void;
    handleClose: () => void;
    // NEW ↓↓↓ when a user opens a subheading we update the hash
    openSectionByAnchor: (anchor: string) => void;
};

type ExplanationPageTranslations = {
    title: string;
};

function getTranslations(t: TFunction): ExplanationPageTranslations {
    const title = t("Title") || "Default Title";
    return { title };
}

const useExplanationPageComponent: UseCase<
    null,
    ExplanationPageModel,
    ExplanationPageOperations
> = () => {
    const { t } = useTranslation(["InfoPage"]);
    const { title } = getTranslations(t);
    const location = useLocation();
    const history = useHistory();

    const [explanationCollection, setExplanationCollection] =
        useState<ExplanationCollection>({});
    const [mainSection, setMainSection] = useState<ExplanationDTO[]>([]);
    const [amrData] = useState<AMRTablesDTO[]>([]);
    const [currentAMRID, setCurrentAMRID] = useState<string>("");
    const [openAmrDialog, setOpenAmrDialog] = useState<boolean>(false);
    const [deepLink, setDeepLink] = useState<string>("");
    // NEW ↓↓↓ which anchor is currently active from the URL
    const [activeAnchor, setActiveAnchor] = useState<string | null>(null);

    // --- keep ?lang in sync with i18next ---
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryLang = params.get("lang");
        if (queryLang && queryLang !== i18next.language) {
            i18next.changeLanguage(queryLang);
        }
    }, [location.search]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("lang") !== i18next.language) {
            params.set("lang", i18next.language);
            // IMPORTANT: preserve the hash when adjusting the query
            history.replace({ search: params.toString(), hash: location.hash });
        }
        const currentUrl = window.location.origin + window.location.pathname;
        setDeepLink(
            `${currentUrl}?lang=${i18next.language}${location.hash || ""}`
        );
    }, [i18next.language, location.search, location.hash, history]);

    // --- read the hash whenever it changes and scroll into view ---
    useEffect(() => {
        const h = (location.hash || "").replace(/^#/, "");
        setActiveAnchor(h || null);
    }, [location.hash]);

    useEffect(() => {
        if (!activeAnchor) return;
        const el = document.getElementById(activeAnchor);
        if (el) {
            // delay to ensure accordion content exists before scrolling
            setTimeout(
                () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
                0
            );
        }
    }, [activeAnchor]);

    // --- load CMS data (anchors are derived from data, no hardcoding) ---
    useEffect(() => {
        callApiService<ExplanationAPIResponse>(
            `${EXPLANATION}?locale=${i18next.language}`
        )
            .then((response) => {
                if (!response.data) return response;

                const items: ExplanationItem[] = response.data.data;

                // Derive a stable anchor per item: prefer slug/uid, else id, else slugified title
                const cmsData: ExplanationDTO[] = items.map((entry) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const anyEntry: any = entry as any;
                    const anchor =
                        anyEntry.slug ||
                        anyEntry.uid ||
                        (entry.id != null
                            ? `sec-${entry.id}`
                            : slugify(entry.title));
                    return {
                        title: entry.title,
                        description: entry.description,
                        section: entry.section,
                        anchor,
                    };
                });

                // Sort by high-level section and group
                const orderedSections = [
                    "HINTERGRUND",
                    "METHODEN",
                    "GRAPHIKEN",
                    "DATEN",
                    "MAIN",
                ];
                const ordered = cmsData.sort((a, b) => {
                    const aIndex = orderedSections.indexOf(a.section);
                    const bIndex = orderedSections.indexOf(b.section);
                    return aIndex - bIndex;
                });

                const grouped = lodash.groupBy(ordered, "section");
                setExplanationCollection(grouped);
                setMainSection(grouped.MAIN || []);
                return response;
            })
            .catch((error) => {
                console.error("Error fetching explanation data:", error);
            });
    }, [t]);

    // --- AMR dialog open/close ---
    const handleOpen = (id: string): void => {
        setCurrentAMRID(id);
        setOpenAmrDialog(true);
    };

    const handleClose = (): void => {
        setOpenAmrDialog(false);
    };

    // --- when a user opens a subheading, update the hash (keeps ?lang) ---
    const openSectionByAnchor = (anchor: string): void => {
        history.push({
            pathname: location.pathname,
            search: location.search,
            hash: `#${anchor}`,
        });
        setActiveAnchor(anchor);
    };

    return {
        model: {
            explanationCollection,
            mainSection,
            amrData,
            title,
            openAmrDialog,
            currentAMRID,
            deepLink,
            activeAnchor,
        },
        operations: {
            handleOpen,
            handleClose,
            openSectionByAnchor,
        },
    };
};

export { useExplanationPageComponent };

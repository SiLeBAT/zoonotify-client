// explanationUseCases.ts
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

/** ---------- Section mapping & labels (hard-coded EN/DE) ---------- */
type SectionCode = "BACKGROUND" | "METHODS" | "GRAPHS" | "DATA" | "MAIN";

const CMS_SECTION_TO_CODE: Record<string, SectionCode> = {
    HINTERGRUND: "BACKGROUND",
    METHODEN: "METHODS",
    GRAPHIKEN: "GRAPHS",
    DATEN: "DATA",
    MAIN: "MAIN",
};

const ORDERED_SECTIONS: SectionCode[] = [
    "BACKGROUND",
    "METHODS",
    "GRAPHS",
    "DATA",
    "MAIN",
];

const SECTION_UI_LABELS: Record<SectionCode, { en: string; de: string }> = {
    BACKGROUND: { en: "Background", de: "Hintergrund" },
    METHODS: { en: "Methods", de: "Methoden" },
    GRAPHS: { en: "Graphs", de: "Grafiken" },
    DATA: { en: "Data", de: "Daten" },
    MAIN: { en: "Explanations", de: "Erläuterungen" },
};

function normLang(lng: string | undefined): "en" | "de" {
    const base = (lng || "en").toLowerCase().split("-")[0];
    return base === "de" ? "de" : "en";
}

function getSectionLabelByCode(code: SectionCode): string {
    const lng = normLang(i18next.language);
    return SECTION_UI_LABELS[code][lng];
}

/** --------------------------------------------------------------- */

type ExplanationPageModel = {
    explanationCollection: ExplanationCollection; // grouped by SectionCode
    mainSection: ExplanationDTO[];
    title: string;
    amrData: AMRTablesDTO[];
    openAmrDialog: boolean;
    currentAMRID: string;
    deepLink: string;
    activeAnchor: string | null;
};

type ExplanationPageOperations = {
    handleOpen: (id: string) => void;
    handleClose: () => void;
    openSectionByAnchor: (anchor: string) => void;
    /** Translate a group key (either raw CMS or our SectionCode) to a UI label */
    getSectionLabel: (groupKey: string) => string;
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
            setTimeout(
                () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
                0
            );
        }
    }, [activeAnchor]);

    // --- load CMS data (normalize sections -> codes) ---
    useEffect(() => {
        callApiService<ExplanationAPIResponse>(
            `${EXPLANATION}?locale=${i18next.language}`
        )
            .then((response) => {
                if (!response.data) return response;

                const items: ExplanationItem[] = response.data.data;

                const cmsData: ExplanationDTO[] = items.map((entry) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const anyEntry: any = entry as any;
                    const anchor =
                        anyEntry.slug ||
                        anyEntry.uid ||
                        (entry.id != null
                            ? `sec-${entry.id}`
                            : slugify(entry.title));

                    // normalize CMS section (German strings) into our SectionCode
                    const sectionCode: SectionCode =
                        CMS_SECTION_TO_CODE[entry.section] ?? "MAIN";

                    return {
                        title: entry.title,
                        description: entry.description,
                        section: sectionCode, // <— store normalized code
                        anchor,
                    } as ExplanationDTO;
                });

                // sort by ORDERED_SECTIONS
                const ordered = cmsData.sort((a, b) => {
                    const aIndex = ORDERED_SECTIONS.indexOf(
                        a.section as SectionCode
                    );
                    const bIndex = ORDERED_SECTIONS.indexOf(
                        b.section as SectionCode
                    );
                    return aIndex - bIndex;
                });

                // group by normalized section code
                const grouped = lodash.groupBy(ordered, "section");
                setExplanationCollection(grouped);
                setMainSection(grouped.MAIN || []);
                return response;
            })
            .catch((error) => {
                console.error("Error fetching explanation data:", error);
            });
    }, [t, i18next.language]);

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

    // --- translate group key to UI header label (handles raw CMS or code) ---
    const getSectionLabel = (groupKey: string): string => {
        const code =
            (groupKey as SectionCode) in CMS_SECTION_TO_CODE
                ? (CMS_SECTION_TO_CODE[
                      groupKey as keyof typeof CMS_SECTION_TO_CODE
                  ] as SectionCode)
                : (groupKey as SectionCode);
        return getSectionLabelByCode(code);
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
            getSectionLabel, // <— expose to UI
        },
    };
};

export { useExplanationPageComponent };

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

// Import the new "flat" interfaces from the same file
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
    // Expose the deep link for sharing
    deepLink: string;
};

type ExplanationPageOperations = {
    handleOpen: (id: string) => void;
    handleClose: () => void;
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

    // Check URL for the "lang" parameter and update language if necessary.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryLang = params.get("lang");
        if (queryLang && queryLang !== i18next.language) {
            i18next.changeLanguage(queryLang);
        }
    }, [location.search]);

    // Whenever the language changes, update the URL so the deep link always contains the correct language.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("lang") !== i18next.language) {
            params.set("lang", i18next.language);
            history.replace({ search: params.toString() });
        }
        // Update the deep link state.
        const currentUrl = window.location.origin + window.location.pathname;
        setDeepLink(`${currentUrl}?lang=${i18next.language}`);
    }, [i18next.language, location.search, history]);

    // API call effect using the current language from i18next.
    useEffect(() => {
        callApiService<ExplanationAPIResponse>(
            `${EXPLANATION}?locale=${i18next.language}`
        )
            .then((response) => {
                if (response.data) {
                    // "response.data.data" is an array of ExplanationItem
                    const data: ExplanationItem[] = response.data.data;

                    // Convert each ExplanationItem into your ExplanationDTO
                    const cmsData: ExplanationDTO[] = data.map((entry) => ({
                        title: entry.title,
                        description: entry.description,
                        section: entry.section,
                    }));

                    // Sort them based on desired section order.
                    const orderedSections = [
                        "HINTERGRUND",
                        "METHODEN",
                        "GRAPHIKEN",
                        "DATEN",
                        "MAIN",
                    ];
                    const orderedCmsData = cmsData.sort((a, b) => {
                        const aIndex = orderedSections.indexOf(a.section);
                        const bIndex = orderedSections.indexOf(b.section);
                        return aIndex - bIndex;
                    });

                    // Group by the original "section"
                    const sectionKeyedData = lodash.groupBy(
                        orderedCmsData,
                        "section"
                    );

                    setExplanationCollection(sectionKeyedData);

                    // Handle special section "MAIN" if present.
                    setMainSection(sectionKeyedData.MAIN || []);
                }
                return response;
            })
            .catch((error) => {
                console.error("Error fetching explanation data:", error);
            });
    }, [t]);

    // Operation handlers for dialog open/close.
    const handleOpen = (id: string): void => {
        setCurrentAMRID(id);
        setOpenAmrDialog(true);
    };

    const handleClose = (): void => {
        setOpenAmrDialog(false);
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
        },
        operations: {
            handleOpen,
            handleClose,
        },
    };
};

export { useExplanationPageComponent };

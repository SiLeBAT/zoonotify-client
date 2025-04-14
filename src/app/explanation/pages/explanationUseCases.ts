// useExplanationPageComponent.ts
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import * as lodash from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
// Import useLocation to parse the URL query parameters
import { useLocation } from "react-router-dom";
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

    const [explanationCollection, setExplanationCollection] =
        useState<ExplanationCollection>({});
    const [mainSection, setMainSection] = useState<ExplanationDTO[]>([]);
    const [amrData] = useState<AMRTablesDTO[]>([]);
    const [currentAMRID, setCurrentAMRID] = useState<string>("");
    const [openAmrDialog, setOpenAmrDialog] = useState<boolean>(false);

    // Effect to check for a 'lang' query parameter in the URL and update the language accordingly.
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryLang = params.get("lang");
        if (queryLang && queryLang !== i18next.language) {
            i18next.changeLanguage(queryLang);
        }
    }, [location.search]);

    // API call effect using the current language from i18next.
    useEffect(() => {
        // Use the language from i18next for the API call.
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

                    // Sort them by your own logic.
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

                    // If you have a special section named "MAIN", handle it here.
                    setMainSection(sectionKeyedData.MAIN || []);
                }
                // Return the response to satisfy the promise/always-return rule.
                return response;
            })
            .catch((error) => {
                console.error("Error fetching explanation data:", error);
            });
    }, [t]); // You could also include i18next.language here if needed.

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
        },
        operations: {
            handleOpen,
            handleClose,
        },
    };
};

export { useExplanationPageComponent };

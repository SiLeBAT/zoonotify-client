// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import * as lodash from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { EXPLANATION } from "../../shared/infrastructure/router/routes";
import { CMSEntity, CMSResponse } from "../../shared/model/CMS.model";
import { UseCase } from "../../shared/model/UseCases";
import {
    AMRTablesDTO,
    ExplanationAttributesDTO,
    ExplanationCollection,
    ExplanationDTO,
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
    handleOpen: (e: string) => void;
    handleClose: () => void;
};

type ExplanationPageTranslations = {
    title: string;
};

function getTranslations(t: TFunction): ExplanationPageTranslations {
    const title = t("Title");
    return { title };
}

const useExplanationPageComponent: UseCase<
    null,
    ExplanationPageModel,
    ExplanationPageOperations
> = () => {
    const { t } = useTranslation(["InfoPage"]);
    const { title } = getTranslations(t);

    const [explanationCollection, setExplanationCollection] =
        useState<ExplanationCollection>({});
    const [mainSection, setMainSection] = useState<ExplanationDTO[]>([]);
    const [amrData] = useState<AMRTablesDTO[]>([]);
    const [currentAMRID, setCurrentAMRID] = useState<string>("");
    const [openAmrDialog, setOpenAmrDialog] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleOpen = (id: string): void => {
        setCurrentAMRID(id);
        setOpenAmrDialog(true);
    };

    const handleClose = (): void => {
        setOpenAmrDialog(false);
    };
    console.log("Translation for HINTERGRUND:", t("Hintergrund"));

    useEffect(() => {
        callApiService<
            CMSResponse<CMSEntity<ExplanationAttributesDTO>[], unknown>
        >(`${EXPLANATION}?locale=${i18next.language}`)
            .then((response) => {
                if (response.data) {
                    const data = response.data.data;
                    const cmsData = data.map((entry) => ({
                        title: entry.attributes.title,
                        description: entry.attributes.description,
                        // Directly use the untranslated section for sorting purposes
                        section: entry.attributes.section,
                        // Include translatedSection for display purposes
                        translatedSection: t(entry.attributes.section),
                    }));

                    // Log the cmsData to make sure the section values are what we expect
                    console.log("CMS Data:", cmsData);

                    // Define the order of the sections as they appear in the enum
                    const orderedSections = [
                        "HINTERGRUND",
                        "METHODEN",
                        "GRAPHIKEN",
                        "DATEN",
                    ];

                    // Log the orderedSections to ensure the order is correct
                    console.log("Ordered Sections:", orderedSections);

                    // Order the cmsData based on the index of each item's section in the orderedSections
                    const orderedCmsData = cmsData.sort((a, b) => {
                        const aIndex = orderedSections.indexOf(a.section);
                        const bIndex = orderedSections.indexOf(b.section);
                        return aIndex - bIndex;
                    });

                    // Log the ordered data to see if it's sorted correctly
                    console.log("Ordered CMS Data:", orderedCmsData);

                    // Group the ordered data by section
                    const sectionKeyedData = lodash.groupBy(
                        orderedCmsData,
                        "translatedSection"
                    );

                    // Log the grouped data to verify the structure
                    console.log("Section Keyed Data:", sectionKeyedData);

                    setExplanationCollection(sectionKeyedData);

                    setMainSection(sectionKeyedData.MAIN || []);
                }
                return response;
            })
            .catch((error) => {
                throw error;
            });
    }, [i18next.language, t]);

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

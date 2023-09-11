// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import * as lodash from "lodash";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import {
    AMR_TABLE,
    EXPLANATION,
} from "../../shared/infrastructure/router/routes";
import { CMSEntity, CMSResponse } from "../../shared/model/CMS.model";
import { UseCase } from "../../shared/model/UseCases";
import {
    AMRTableAttributesDTO,
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
    const [amrData, setAmrData] = useState<AMRTablesDTO[]>([]);
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

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callApiService<
            CMSResponse<CMSEntity<ExplanationAttributesDTO>[], unknown>
        >(`${EXPLANATION}?locale=${i18next.language}`)
            .then((response) => {
                if (response.data) {
                    const data = response.data.data;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const cmsData = data.map((entry) => ({
                        title: entry.attributes.title,
                        description: entry.attributes.description,
                        section: t(entry.attributes.section),
                    }));
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const sectionKeyedData: any = lodash.groupBy(
                        cmsData,
                        "section"
                    );
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    const { HAUPT: _, ...sectionsWithoutMain } =
                        sectionKeyedData;

                    setExplanationCollection(sectionsWithoutMain);
                    setMainSection(sectionKeyedData.HAUPT || []);
                }
                return response;
            })
            .catch((error) => {
                throw error;
            });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callApiService<
            CMSResponse<CMSEntity<AMRTableAttributesDTO>[], unknown>
        >(`${AMR_TABLE}?locale=${i18next.language}`)
            .then((response) => {
                if (response.data) {
                    const data = response.data.data;
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const cmsData: AMRTablesDTO[] = data.map((entry) => ({
                        title: entry.attributes.title,
                        description: entry.attributes.description,
                        table_id: entry.attributes.table_id,
                        yearly_cut_off: entry.attributes.yearly_cut_off,
                    }));

                    setAmrData(cmsData);
                }
                return response;
            })
            .catch((error) => {
                throw error;
            });
    }, [i18next.language]);

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

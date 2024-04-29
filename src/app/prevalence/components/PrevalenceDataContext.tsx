import React, { ReactNode, createContext, useContext, useState } from "react";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { PREVALENCES } from "../../shared/infrastructure/router/routes";
import {
    CMSEntity,
    CMSResponse,
    MAX_PAGE_SIZE,
} from "../../shared/model/CMS.model";

const microorganismOptions = [
    "Baylisascaris procyonis",
    "CARBA-E. coli",
    "Campylobacter spp.",
    "Clostridioides difficile",
    "Duncker'scher Muskelegel",
    "ESBL/AmpC-E. coli",
    "Echinococcus spp.",
    "Hepatitis-A-Virus",
    "Hepatitis-E-Virus",
    "Koagulase positiven Staphylokokken",
    "Kommensale E. coli",
    "Listeria monocytogenes",
    "MRSA",
    "Norovirus",
    "Präsumtive Bacillus cereus",
    "STEC",
    "Salmonella spp.",
    "Vibrio spp.",
    "Yersinia enterocolitica",
];

export type SearchParameters = Record<string, string[]>;
interface RelationalData {
    id: number;
    attributes: {
        name: string;
    };
}
interface PrevalenceAttributesDTO {
    samplingYear: number;
    numberOfSamples: number;
    numberOfPositive: number;
    percentageOfPositive: number;
    ciMin: number;
    ciMax: number;
    matrix: RelationalData;
    matrixDetail: RelationalData;
    matrixGroup: RelationalData;
    microorganism: RelationalData;
}
export type PrevalenceEntry = {
    id: number;
    samplingYear: number;
    numberOfSamples: number;
    numberOfPositive: number;
    percentageOfPositive: number;
    ciMin: number;
    ciMax: number;
    matrix: string;
    samplingStage: string;
    sampleOrigin: string;
    microorganism: string;
};

interface PrevalenceDataContext {
    microorganismOptions: string[];
    selectedMicroorganisms: string[];
    setSelectedMicroorganisms: (microorganisms: string[]) => void;
    fetchDataFromAPI: () => void;
    prevalenceData: PrevalenceEntry[];
    error: string | null;
    loading: boolean;
    searchParameters: SearchParameters;
}

const DefaultPrevalenceDataContext = createContext<
    PrevalenceDataContext | undefined
>(undefined);

export const usePrevalenceFilters = (): PrevalenceDataContext => {
    const context = useContext(DefaultPrevalenceDataContext);
    if (context === undefined) {
        throw new Error(
            "usePrevalenceFilters must be used within a PrevalenceDataProvider"
        );
    }
    return context;
};

export const PrevalenceDataProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [selectedMicroorganisms, setSelectedMicroorganisms] = useState<
        string[]
    >([]);

    const [prevalenceData, setData] = useState<PrevalenceEntry[]>([]);
    const [searchParameters, setSearchParameters] = useState<SearchParameters>(
        {}
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    function processApiResponse(
        apiData: CMSEntity<PrevalenceAttributesDTO>[]
    ): PrevalenceEntry[] {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = apiData.flat().map((item: any) => ({
            id: item.id,
            samplingYear: item.attributes.samplingYear,
            furtherDetails: item.attributes.furtherDetails,
            numberOfSamples: item.attributes.numberOfSamples,
            numberOfPositive: item.attributes.numberOfPositive,
            percentageOfPositive: item.attributes.percentageOfPositive,
            ciMin: item.attributes.ciMin,
            ciMax: item.attributes.ciMax,
            matrix: item.attributes.matrix.data.attributes.name,
            samplingStage: item.attributes.samplingStage.data.attributes.name,
            microorganism: item.attributes.microorganism.data.attributes.name,
            sampleOrigin: item.attributes.sampleOrigin.data.attributes.name,
        }));
        return result;
    }

    const fetchDataFromAPI = async (): Promise<void> => {
        setLoading(true);
        try {
            const microSelection = selectedMicroorganisms.map(
                (micro) => "filters[microorganism][name][$eq]=" + micro
            );
            const response = await callApiService<
                CMSResponse<CMSEntity<PrevalenceAttributesDTO>[], unknown>
            >(
                `${PREVALENCES}?populate=*&pagination[pageSize]=${MAX_PAGE_SIZE}&` +
                    microSelection.join("&")
            );
            if (response.data) {
                const result = processApiResponse(response.data.data);
                setData(result);
                setSearchParameters({
                    microorganism:
                        selectedMicroorganisms.length ===
                        microorganismOptions.length
                            ? ["ALL_VALUES"]
                            : selectedMicroorganisms,
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Fetching data failed", err);
            setError(err.message);
        }
        setLoading(false);
    };

    const value = {
        selectedMicroorganisms,
        setSelectedMicroorganisms,
        microorganismOptions,
        fetchDataFromAPI,
        prevalenceData,
        error,
        loading,
        searchParameters,
    };

    return (
        <DefaultPrevalenceDataContext.Provider value={value}>
            {children}
        </DefaultPrevalenceDataContext.Provider>
    );
};

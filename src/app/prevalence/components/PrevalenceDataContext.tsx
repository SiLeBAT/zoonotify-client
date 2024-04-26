import axios from "axios";
import React, { ReactNode, createContext, useContext, useState } from "react";

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
interface PrevalenceAttributes {
    samplingYear: number;
    numberOfSamples: number;
    numberOfPositive: number;
    percentageOfPositive: number;
    ciMin: number;
    ciMax: number;
    matrix?: RelationalData;
    matrixDetail?: RelationalData;
    matrixGroup?: RelationalData;
    microorganism?: RelationalData;
}
interface PrevalenceDataItem {
    id: number;
    attributes: PrevalenceAttributes;
}
interface PrevalenceDataContext {
    microorganismOptions: string[];
    selectedMicroorganisms: string[];
    setSelectedMicroorganisms: (microorganisms: string[]) => void;
    callAPI: () => void;
    prevalenceData: PrevalenceDataItem[];
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

    const [prevalenceData, setData] = useState<PrevalenceDataItem[]>([]);
    const [searchParameters, setSearchParameters] = useState<SearchParameters>(
        {}
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const callAPI = (): void => {
        setLoading(true);
        const fetchData = async (
            microorganismName: string
        ): Promise<PrevalenceDataItem[]> => {
            let allData: PrevalenceDataItem[] = []; // Define the type of allData
            const pageSize = 100; // or the maximum allowed by your API
            let page = 0;

            try {
                // Keep fetching data until all pages have been fetched
                while (true) {
                    const response = await axios.get(
                        `http://localhost:1337/api/prevalences`,
                        {
                            params: {
                                populate: "*",
                                "filters[microorganism][name][$eq]":
                                    microorganismName,
                                "pagination[start]": page * pageSize,
                                "pagination[limit]": pageSize,
                            },
                        }
                    );

                    const incomingData: PrevalenceDataItem[] =
                        response.data.data; // Cast the response data to the correct type
                    allData = allData.concat(incomingData);

                    // Break the loop if the last page has fewer items than the page size
                    if (incomingData.length < pageSize) {
                        break;
                    }

                    page++;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error("Error fetching data:", err);
                setError(err.message);
            }

            return allData;
        };

        const aryOfPromises = selectedMicroorganisms.map(fetchData);
        // eslint-disable-next-line promise/catch-or-return
        Promise.all(aryOfPromises)
            .then((results) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const aggregatedData = results.flat().map((item: any) => ({
                    id: item.id,
                    attributes: {
                        ...item.attributes,
                        matrix: item.attributes.matrix?.data,
                        matrixDetail: item.attributes.matrixDetail?.data,
                        matrixGroup: item.attributes.matrixGroup?.data,
                        microorganism: item.attributes.microorganism?.data,
                        sampleOrigin: item.attributes.sampleOrigin?.data,
                    },
                }));
                setData(aggregatedData);
                setLoading(false);
                setSearchParameters({
                    microorganism:
                        selectedMicroorganisms.length ===
                        microorganismOptions.length
                            ? ["ALL_VALUES"]
                            : selectedMicroorganisms,
                });
                return aggregatedData;
            })
            .catch((err) => {
                console.error("Error setting data:", err);
                setError(err.message);
            });
    };

    const value = {
        selectedMicroorganisms,
        setSelectedMicroorganisms,
        microorganismOptions,
        callAPI,
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

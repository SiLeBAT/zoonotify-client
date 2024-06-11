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
    "Duncker´scher Muskelegel",
    "ESBL/AmpC-E. coli",
    "Echinococcus spp. ",
    "Hepatitis-A-Virus",
    "Hepatitis-E-Virus ",
    "Listeria monocytogenes",
    "MRSA",
    "Norovirus",
    "Präsumtive Bacillus cereus ",
    "STEC",
    "Salmonella spp.",
    "Vibrio spp.",
    "Yersinia enterocolitica",
];
const sampleOriginOptions = [
    "Cypriniden (Karpfenartige)",
    "Enten und Gänse",
    "Fisch",
    "Futtermittel für Mastschwein",
    "Futtermittel für Legehennen",
    "Futtermittel für Nutztiere",
    "Futtermittel",
    "Füchse",
    "Kälber zur Mast (aufgezogen in Mastrinderbetrieben)",
    "Kälber zur Mast (aufgezogen in Milchviehbetrieben)",
    "Kälber zur Mast (für die Schlachtung mit spätestens 12 Monaten)",
    "Krebstiere",
    "Lamm",
    "Legehennen",
    "Legehennen, konventionell",
    "Läufer bis 30 kg",
    "Mastenten",
    "Mastgeflügel",
    "Masthähnchen",
    "Masthähnchen, konventionell",
    "Masthähnchen, ökologisch",
    "Mastkalb/Jungrind",
    "Mastputen",
    "Mastputen, konventionell",
    "Mastputen, ökologisch",
    "Mastrind",
    "Mastschwein",
    "Mastschwein / Rind",
    "Mastschwein bis 50 kg",
    "Mastschwein, konventionell",
    "Mastschwein, ökologisch",
    "Milchrind",
    "Milchrind, konventionell",
    "Milchrind, ökologisch",
    "Pflanzen",
    "Rehwild",
    "Rind",
    "Salmonidae (Lachs- bzw. Forellenfische)",
    "Schaf und Ziege für Milchproduktion",
    "Sonstige",
    "Tilapia und Pangasius",
    "Waschbären",
    "Wiederkäuer für Milchproduktion",
    "Wildkarnivoren",
    "Wildschwein",
    "Wildwiederkäuer",
    "Zuchthühner, Legelinie",
    "Zuchthühner, Mastlinie",
    "Zuchtputen",
    "Zuchtsauen",
];
const matrixGroupOptions = [
    "(Hals)haut und Schlachtkörper (Lebensmittelproben)",
    "Babyspinat",
    "Blattsalate",
    "Blatt- und Kopfsalate",
    "Futtermittel aus Ölsaaten und Ölfrüchten",
    "Vegetarische/Vegane Ersatzprodukte",
    "Erdbeeren",
    "Allein- und Mischfuttermittel",
    "Eier und Eiprodukte",
    "Fisch und Erzeugnisse daraus",
    "Fleisch und Fleischerzeugnisse",
    "Futtermittel aus Ölsaaten und Ölfrüchten",
    "Gemüse und Gemüseerzeugnisse",
    "Getreide und ähnliche, sowie deren Primärderivate",
    "Haut (Tierproben)",
    "Kiemeninhalt (Tierproben)",
    "Kot und Blinddarminhalt (Tierproben)",
    "Kot/Staub (Tierproben)",
    "Kräuter, Gewürze und ähnliche",
    "Meeresfrüchte und Erzeugnisse daraus",
    "Milch (Tierproben)",
    "Milch und Milchprodukte",
    "Muskulatur (Tierproben)",
    "Nasentupfer (Tierproben)",
    "Obst und Obsterzeugnisse",
    "Pilze",
    "Staub (Tierproben)",
    "Vegetarische/Vegane Ersatzprodukte",
    "Ölsaaten und Ölfrüchte",
];
const matrixOptions = [
    "(Hals)haut",
    "Alleinfuttermittel, Sackware und lose Ware",
    "Babyspinat, frisch",
    "Backenfleisch",
    "Blatt- und Kopfsalate, insb. Feldsalat, Rucola, Spinat, Eisberg",
    "Blattsalate, vorgeschnitten, verpackt",
    "Blinddarminhalt",
    "Eierschalen, Eier, unsortiert",
    "Eierschalen, Konsumeier, sortiert",
    "Eigelb, Konsumeier, sortiert",
    "Erdbeeren, frisch",
    "Feldsalat, Rucola oder Pflücksalat, in Fertigpackungen",
    "Fleischzubereitungen",
    "Frische Kräuter, lose oder verpackt; geschnitten oder Topfware",
    "Frisches Fleisch",
    "Futtermittel: Extraktionsschrote, hauptsächlich Soja",
    "Futtermittel: Rapspresskuchen",
    "Futtermittel: Rapssaaten",
    "Futtermittel: Ölsaaten",
    "Futtermittel: Ölsaaten, hauptsächlich Soja",
    "Garnelen",
    "Getrocknete Blatt- und Grasprodukte, Pulver- oder Blattform",
    "Hackfleisch",
    "Haut",
    "Himbeeren, tiefgekühlt",
    "Kiemeninhalt",
    "Kokosstückchen, getrocknete Erzeugnisse, Snack",
    "Kopfsalat, ungewaschen",
    "Kot",
    "Kot/Staub",
    "Leber",
    "Mischfuttermittel, Sackware und lose Ware",
    "Muskel",
    "Muskulatur",
    "Nasentupfer",
    "Oliven, Schwarz oder geschwärzt",
    "Petersilie, tiefgekühlt",
    "Rohmilch, zur weiteren Bearbeitung",
    "Rohmilchkäse",
    "Sammelmilch",
    "Schlachtkörper",
    "Sesam, unbehandelt",
    "Sprossen, lose oder verpackt",
    "Staub",
    "Streichfähige Rohwürste",
    "Tatar/Schabefleisch",
    "Tomaten, kleine Sorten",
    "Trockenpilze, getrocknet",
    "Vegetarischer/veganer Wurstaufschnitt, gekühlt",
    "Verzehrfertige Brühwursterzeugnisse",
    "Vorzugsmilch",
    "Weizenmehl, vor der Verpackung in der Mühle",
];

const samplingStageOptions = [
    "Dezentrale Ölmühlen",
    "Einzelhandel",
    "Erzeugerbetrieb",
    "Futtermittelbetriebe",
    "Grenzkontrollstellen",
    "Hersteller und Abpacker",
    "Mischfutterwerk",
    "Mühlen",
    "Packstellen",
    "Schlachthof",
    "Verarbeitungsbetrieb",
    "Wildbahn",
    "Zentrale Ölmühlen",
];
const superCategorySampleOriginOptions = [
    "Futtermittel",
    "Huhn (Tier-/ Lebensmittelproben)",
    "Rind (Tier-/ Lebensmittelproben)",
    "Pute (Tier-/ Lebensmittelproben)",
    "Schwein (Tier-/ Lebensmittelproben)",
    "Wildtiere (Tier-/ Lebensmittelproben)",
    "Ente (Tier-/ Lebensmittelproben)",
    "Schwein und Rind (Tier-/Lebensmittelproben)",
    "Geflügel (Lebensmittelproben)",
    "Wiederkäuer (Tier-/ Lebensmittelproben)",
    "Fisch/Meeresfrüchte (Tier-/ Lebensmittelproben)",
    "Lebensmittel nicht-tierischen Ursprungs",
];

const yearOptions = [
    2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020,
    2021, 2022,
];

export type SearchParameters = Record<string, string[]>;
interface RelationalData {
    id: number;
    data: {
        attributes: {
            name: string;
        };
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
    samplingStage: RelationalData;
    sampleOrigin: RelationalData;
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

    sampleOriginOptions: string[];
    selectedSampleOrigins: string[];
    setSelectedSampleOrigins: (sampleOrigins: string[]) => void;

    matrixOptions: string[];
    selectedMatrices: string[];
    setSelectedMatrices: (matrices: string[]) => void;

    samplingStageOptions: string[];
    selectedSamplingStages: string[];
    setSelectedSamplingStages: (samplingStages: string[]) => void;

    matrixGroupOptions: string[];
    selectedMatrixGroups: string[];
    setSelectedMatrixGroups: (matrixGroups: string[]) => void;

    yearOptions: number[];
    selectedYear: number[];
    setSelectedYear: (year: number[]) => void;

    superCategorySampleOriginOptions: string[];
    selectedSuperCategory: string[];
    setSelectedSuperCategory: (superCategory: string[]) => void;

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
    const [selectedSampleOrigins, setSelectedSampleOrigins] = useState<
        string[]
    >([]);
    const [selectedMatrices, setSelectedMatrices] = useState<string[]>([]);
    const [selectedSamplingStages, setSelectedSamplingStages] = useState<
        string[]
    >([]);

    const [selectedYear, setSelectedYear] = useState<number[]>([]);
    const [selectedSuperCategory, setSelectedSuperCategory] = useState<
        string[]
    >([]);

    const [selectedMatrixGroups, setSelectedMatrixGroups] = useState<string[]>(
        []
    );

    const [prevalenceData, setData] = useState<PrevalenceEntry[]>([]);
    const [searchParameters, setSearchParameters] = useState<SearchParameters>(
        {}
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    function processApiResponse(
        apiData: CMSEntity<PrevalenceAttributesDTO>[],
        setApiError: (message: string) => void
    ): PrevalenceEntry[] {
        const validEntries: PrevalenceEntry[] = [];
        const errors: string[] = [];

        apiData.forEach((item: CMSEntity<PrevalenceAttributesDTO>) => {
            try {
                const entry: PrevalenceEntry = {
                    id: item.id,
                    matrix: item.attributes.matrix.data.attributes.name,
                    samplingStage:
                        item.attributes.samplingStage.data.attributes.name,
                    microorganism:
                        item.attributes.microorganism.data.attributes.name,
                    sampleOrigin:
                        item.attributes.sampleOrigin.data.attributes.name,
                    samplingYear: item.attributes.samplingYear,
                    numberOfSamples: item.attributes.numberOfSamples,
                    numberOfPositive: item.attributes.numberOfPositive,
                    percentageOfPositive: item.attributes.percentageOfPositive,
                    ciMin:
                        item.attributes.ciMin !== undefined
                            ? item.attributes.ciMin
                            : 0,
                    ciMax:
                        item.attributes.ciMax !== undefined
                            ? item.attributes.ciMax
                            : 0,
                };

                // Perform validation checks here
                if (
                    entry.numberOfSamples > 0 &&
                    entry.numberOfPositive >= 0 &&
                    entry.percentageOfPositive >= 0
                ) {
                    validEntries.push(entry);
                } else {
                    errors.push(
                        `Entry with ID ${item.id} contains invalid data.`
                    );
                }
            } catch (err) {
                errors.push(
                    `Entry with ID ${item.id} could not be processed due to an error.`
                );
            }
        });

        // Display a warning message if there are any errors
        if (errors.length > 0) {
            console.warn(
                "Some prevalence data entries could not be displayed:",
                errors
            );
            setApiError("error.notAllDataRetrieved");
        }

        return validEntries;
    }
    const fetchDataFromAPI = async (): Promise<void> => {
        setLoading(true);
        try {
            const microSelection = selectedMicroorganisms.map(
                (micro) => `filters[microorganism][name][$eq]=` + micro
            );
            const originSelection = selectedSampleOrigins.map(
                (origin) => `filters[sampleOrigin][name][$eq]=` + origin
            );
            const matrixSelection = selectedMatrices.map(
                (matrix) => `filters[matrix][name][$eq]=` + matrix
            );
            const samplingStageSelection = selectedSamplingStages.map(
                (stage) => `filters[samplingStage][name][$eq]=` + stage
            );
            const matrixGroupSelection = selectedMatrixGroups.map(
                (group) => `filters[matrixGroup][name][$eq]=` + group
            );
            const yearSelection = selectedYear.map(
                (year) => `filters[samplingYear][$eq]=${year}`
            );
            const superCategorySelection = selectedSuperCategory.map(
                (superCategory) =>
                    `filters[superCategorySampleOrigin][name][$eq]=` +
                    superCategory
            );
            const query =
                `${PREVALENCES}?populate=*&pagination[pageSize]=${MAX_PAGE_SIZE}&` +
                `${microSelection.join("&")}&` +
                `${originSelection.join("&")}&` +
                `${matrixSelection.join("&")}&` +
                `${samplingStageSelection.join("&")}&` +
                `${matrixGroupSelection.join("&")}&` +
                `${yearSelection.join("&")}&` +
                `${superCategorySelection.join("&")}`;

            const response = await callApiService<
                CMSResponse<CMSEntity<PrevalenceAttributesDTO>[], unknown>
            >(query);
            if (response.data) {
                const result = processApiResponse(response.data.data, setError); // Pass setError here
                setData(result);
                setSearchParameters({
                    microorganism:
                        selectedMicroorganisms.length ===
                        microorganismOptions.length
                            ? ["ALL_VALUES"]
                            : selectedMicroorganisms,
                    sampleOrigin:
                        selectedSampleOrigins.length ===
                        sampleOriginOptions.length
                            ? ["ALL_VALUES"]
                            : selectedSampleOrigins,
                    matrix:
                        selectedMatrices.length === matrixOptions.length
                            ? ["ALL_VALUES"]
                            : selectedMatrices,
                    samplingStage:
                        selectedSamplingStages.length ===
                        samplingStageOptions.length
                            ? ["ALL_VALUES"]
                            : selectedSamplingStages,
                    matrixGroup:
                        selectedMatrixGroups.length ===
                        matrixGroupOptions.length
                            ? ["ALL_VALUES"]
                            : selectedMatrixGroups,
                    samplingYear:
                        selectedYear.length === yearOptions.length
                            ? ["ALL_VALUES"]
                            : selectedYear.map(String),
                    superCategorySampleOrigin:
                        selectedSuperCategory.length ===
                        superCategorySampleOriginOptions.length
                            ? ["ALL_VALUES"]
                            : selectedSuperCategory,
                });
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error("Fetching data failed", err);
            setError(err.message);
        }
        setLoading(false);
    };

    const value: PrevalenceDataContext = {
        selectedMicroorganisms,
        setSelectedMicroorganisms,
        microorganismOptions,
        selectedSampleOrigins,
        setSelectedSampleOrigins,
        sampleOriginOptions,
        selectedMatrices,
        setSelectedMatrices,
        matrixOptions,
        selectedSamplingStages,
        setSelectedSamplingStages,
        samplingStageOptions,
        selectedMatrixGroups,
        setSelectedMatrixGroups,
        matrixGroupOptions,
        selectedYear,
        setSelectedYear,
        yearOptions,
        selectedSuperCategory,
        setSelectedSuperCategory,
        superCategorySampleOriginOptions,
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

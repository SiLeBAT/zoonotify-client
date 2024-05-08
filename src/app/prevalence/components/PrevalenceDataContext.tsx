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
const matrixOptions = [
    "(Hals)haut",
    "Alleinfuttermittel, Sackware und lose Ware",
    "Babyspinat, frisch",
    "Backenfleisch",
    "Blatt- und Kopfsalate, insb. Feldsalat, Rucola, Spinat, Eisberg",
    "Blattsalate, verzehrfertig, gekühlt",
    "Blattsalate, vorgeschnitten, verpackt",
    "Blinddarminhalt",
    "Buchweizenmehl",
    "Eierschalen, Eier, unsortiert",
    "Eierschalen, Konsumeier, sortiert",
    "Eigelb, Konsumeier, sortiert",
    "Erdbeeren, frisch",
    "Extraktionsschrote, hauptsächlich Soja",
    "Feldsalat, Rucola oder Pflücksalat, in Fertigpackungen",
    "Fleischerzeugnisse",
    "Fleischzubereitungen",
    "Frische Kräuter, lose oder verpackt; geschnitten oder Topfware",
    "Frisches Fleisch",
    "Garnelen",
    "Gemüseerzeugnis, roh, vorzerkleinert, verzehrfertig",
    "Getrocknete Blatt- und Grasprodukte, Pulver- oder Blattform",
    "Grünkernmehl",
    "Hackfleisch",
    "Haut",
    "Himbeeren, tiefgekühlt",
    "Kiemeninhalt",
    "Kokosstückchen, getrocknete Erzeugnisse, Snack",
    "Kopfsalat, ungewaschen",
    "Kot",
    "Leber",
    "Maismehl",
    "Mischfuttermittel, Sackware und lose Ware",
    "Mischfuttermittel, mit tierischen Nebenprodukten",
    "Muskel",
    "Muskulatur",
    "Nasentupfer",
    "Oliven, Schwarz oder geschwärzt",
    "Petersilie, tiefgekühlt",
    "Rapspresskuchen",
    "Rapssaaten",
    "Reismehl",
    "Rohmilch, zur weiteren Bearbeitung",
    "Rohmilchkäse",
    "Räucherlachs",
    "Sammelmilch",
    "Schlachtkörper",
    "Sesam, unbehandelt",
    "Sesamprodukte, Tahini und Halva",
    "Sprossen, lose oder verpackt",
    "Staub",
    "Streichfähige Rohwürste",
    "Tatar/Schabefleisch",
    "Tomaten, kleine Sorten",
    "Trockenpilze, getrocknet",
    "Vegetarischer/veganer Wurstaufschnitt, gekühlt",
    "Verzehrfertige Brühwursterzeugnisse",
    "Vorzugsmilch",
    "Weichkäse und halbfester Schnittkäse",
    "Weizenmehl, vor der Verpackung in der Mühle",
    "Zuckermelonen, Schale und Fruchtfleisch",
    "Ölsaaten, bei Anlieferung im Futtermittelbetrieb",
    "Ölsaaten, hauptsächlich Soja",
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

    sampleOriginOptions: string[];
    selectedSampleOrigins: string[];
    setSelectedSampleOrigins: (sampleOrigins: string[]) => void;

    matrixOptions: string[];
    selectedMatrices: string[];
    setSelectedMatrices: (matrices: string[]) => void;

    samplingStageOptions: string[];
    selectedSamplingStages: string[];
    setSelectedSamplingStages: (samplingStages: string[]) => void;

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
            ciMin: item.attributes.ciMin != null ? item.attributes.ciMin : 0, // Handle null
            ciMax: item.attributes.ciMax != null ? item.attributes.ciMax : 0, // Handle null
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

            const query = `${PREVALENCES}?populate=*&pagination[pageSize]=${MAX_PAGE_SIZE}&${microSelection.join(
                "&"
            )}&${originSelection.join("&")}&${matrixSelection.join(
                "&"
            )}&${samplingStageSelection.join("&")}`;
            const response = await callApiService<
                CMSResponse<CMSEntity<PrevalenceAttributesDTO>[], unknown>
            >(query);
            if (response.data) {
                const result = processApiResponse(response.data.data);
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
        selectedSampleOrigins,
        setSelectedSampleOrigins,
        sampleOriginOptions,
        selectedMatrices,
        setSelectedMatrices,
        matrixOptions,
        selectedSamplingStages,
        setSelectedSamplingStages,
        samplingStageOptions,
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

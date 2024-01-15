import { ISOLATES_LINKS } from "../../shared/infrastructure/router/routes";
import {
    FilterSelection,
    SelectionFilterConfig,
    SelectionItem,
} from "../model/LinkedData.model";
// eslint-disable-next-line import/named
import i18next, { TFunction } from "i18next";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { CMSResponse } from "../../shared/model/CMS.model";
import { UseCase } from "../../shared/model/UseCases";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LinkedDataPageModel = {
    filterButtonText: string;
    searchButtonText: string;
    heading: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[];
    selectionConfig: SelectionFilterConfig[];
    selectedFilters: FilterSelection;
    loading: boolean;
};

type LinkedDataPageOperations = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fetchData: (filter: FilterSelection, contentType: string) => any;
};

type LinkedDataPageTranslations = {
    filterButtonText: string;
    searchButtonText: string;
    heading: Record<string, string>;
};

const maxPageSize = 250;
const microorganism = [
    "CARBA-E. coli",
    "Campylobacter spp.",
    "E. coli",
    "ESBL/AmpC-E. coli",
    "Enterococcus spp.",
    "Listeria monocytogees",
    "MRSA",
    "STEC",
    "Salmonella spp.",
];
const animalSpeciesFoodTopCategory = [
    "Geflügel",
    "Huhn",
    "kleine Wiederkäuer",
    "Meeresfrüchte",
    "Nutztiere",
    "Pflanzliche Lebensmittel",
    "Pute",
    "Rehwild",
    "Rind",
    "Schwein",
    "Süßwasserfische",
];
const animalSpeciesProductionDirectionFood = [
    "Blattgemüse",
    "Cypriniden (Karpfenartige)",
    "Enten und Gänse",
    "Gemüse",
    "Getreide",
    "Huhn",
    "Kälber zur Mast (aufgezogen in Mastrinderbetrieben)",
    "Kälber zur Mast (aufgezogen in Milchviehbetrieben)",
    "Kälber zur Mast (für die Schlachtung mit spätestens 12 Monaten)",
    "Kräuter",
    "Krebstiere",
    "Lamm",
    "Läufer bis 30 kg",
    "Lebensmittel aus Blättern und Gräsern",
    "Legehennen",
    "Legehennen, konventionell",
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
    "Mastschwein bis 50 kg",
    "Mastschwein, konventionell",
    "Mastschwein, ökologisch",
    "Milchrind",
    "Milchrind, konventionell",
    "Milchrind, ökologisch",
    "Nutztiere",
    "Obst",
    "Rehwild",
    "Rind",
    "Schaf und Ziege für Milchproduktion",
    "Tilapia und Pangasius",
    "Wiederkäuer",
    "Wiederkäuer für Milchproduktion",
    "Wildschwein",
    "Wildwiederkäuer",
    "Zuchthühner, Lege- und Mastlinie",
    "Zuchthühner, Legelinie",
    "Zuchthühner, Mastlinie",
    "Zuchtputen",
    "Zuchtsauen",
    "Zweischalige Weichtiere",
];
const matrix = [
    "Konsumeier, sortiert",
    "Frische Kräuter",
    "Sammelmilch",
    "Ölsaaten/Ölfruchte und Extraktionsschrote",
    "Petersilie",
    "Frisches Fleisch",
    "Blatt- und Kopfsalate",
    "Weizenmehl",
    "Sprossen",
    "(Hals),haut",
    "Schlachtkörper",
    "Kot/Staub",
    "Schlachtkörper",
    "Muskel",
    "Tatar/Schabefleisch",
    "Feldsalat, Rucola oder Pflücksalat",
    "Babyspinat",
    "Getrocknete Blatt- und Grasprodukte",
    "Rohmilchkäse",
    "Garnelen",
    "Kot",
    "Kiemeninhalt",
    "Eier, unsortiert",
    "Weichkäse und halbfester Schnittkäse",
    "Schlachtkörper",
    "Staub",
    "Alleinfuttermittel",
    "Frisches Fleisch",
    "Erdbeeren",
    "Nasentupfer",
    "Streichfähige Rohwürste",
    "Frisches Fleisch",
    "Muscheln",
    "Tomaten",
    "Blinddarminhalt",
    "Kot",
    "Haut",
    "Nasenschleimhaut",
    "Hackfleisch",
    "Blattsalate",
];

const initialFilterSelection: FilterSelection = {
    matrix: [],
    animalSpeciesProductionDirectionFood: [],
    animalSpeciesFoodTopCategory: [],
    microorganism: [],
};
function getTranslations(t: TFunction): LinkedDataPageTranslations {
    const searchButtonText = t("Search");
    const filterButtonText = t("Filter");
    const heading = {
        main: "Linked Data Playground",
    };
    return {
        heading,
        searchButtonText,
        filterButtonText,
    };
}

function toSelectionItem(stringItems: string[], t: TFunction): SelectionItem[] {
    return stringItems.map((item: string) => ({
        value: item,
        displayName: t(item),
    }));
}

const useLinkedDataPageComponent: UseCase<
    null,
    LinkedDataPageModel,
    LinkedDataPageOperations
> = () => {
    const { t } = useTranslation(["ExplanationPage"]);

    const [data, setData] = useState([]);

    const availableOptions = {
        matrix: toSelectionItem(matrix, t),
        animalSpeciesProductionDirectionFood: toSelectionItem(
            animalSpeciesProductionDirectionFood,
            t
        ),
        animalSpeciesFoodTopCategory: toSelectionItem(
            animalSpeciesFoodTopCategory,
            t
        ),
        microorganism: toSelectionItem(microorganism, t),
    };

    const { heading, searchButtonText, filterButtonText } = getTranslations(t);

    const [selectedFilters, setSelectedFilters] = useState(
        initialFilterSelection
    );

    const [loading, setLoading] = useState(false);

    const camelToUnderscore = (key: string): string => {
        const result = key.replace(/([A-Z])/g, " $1");
        return result.split(" ").join("_").toLowerCase();
    };

    const createQueryString = (selection: FilterSelection): string => {
        const query: string[] = [];
        Object.entries(selection).map(([key, value]) => {
            if (value.length > 0) {
                const queryString = value
                    .map(
                        (v, index) =>
                            "filters[$or][" +
                            index +
                            "][" +
                            camelToUnderscore(key) +
                            "][name][$eq]=" +
                            t(v, { lng: "de" })
                    )
                    .join("&");
                query.push(queryString);
            }
        });
        return query.join("&");
    };

    const fetchData = (filter: FilterSelection, contentType: string): void => {
        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type":
                    contentType == "JSON"
                        ? "application/json"
                        : "application/ld+json",
            },
        };
        const qString = createQueryString(filter);
        setLoading(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callApiService<CMSResponse<any, unknown>>(
            `${ISOLATES_LINKS}?locale=${i18next.language}&populate=*&${qString}&pagination[pageSize]=${maxPageSize}`,
            options
        )
            .then((response) => {
                let records = response.data?.data;
                // let meta = response.data?.meta;
                records = records ? records : response.data;

                setData(records as []);
                setLoading(false);
                return data;
            })
            .catch((error) => {
                setLoading(false);
                throw error;
            });
    };

    const availableFilters = [
        "otherDetail",
        "matrix",
        "animalSpeciesProductionDirectionFood",
        "animalSpeciesFoodTopCategory",
        "microorganism",
    ];

    const selectionConfig: SelectionFilterConfig[] = availableFilters.map(
        (filter) => {
            return {
                label: t(filter.toUpperCase()),
                id: filter,
                selectedItems: selectedFilters[filter as keyof FilterSelection],
                selectionOptions:
                    availableOptions[filter as keyof FilterSelection],
                handleChange: (event: { target: { value: string } }): void => {
                    const {
                        target: { value },
                    } = event;

                    setSelectedFilters((prev) => {
                        const newFilters = { ...prev };
                        newFilters[filter as keyof FilterSelection] =
                            typeof value === "string"
                                ? value.split(",")
                                : value;

                        return newFilters;
                    });
                },
            };
        }
    );

    return {
        model: {
            searchButtonText,
            filterButtonText,
            heading,
            data,
            selectionConfig,
            selectedFilters,
            loading,
        },
        operations: {
            fetchData,
        },
    };
};

export { useLinkedDataPageComponent };

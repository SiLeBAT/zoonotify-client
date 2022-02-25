import { TFunction } from "i18next";
import { replaceAll } from "../../../../../Core/replaceAll.service";
import {
    genesCollection,
    DbCollection,
} from "../../../../../Shared/Model/Client_Isolate.model";

function checkAndTranslate(key: string, value: string, t: TFunction): string {
    if (value === null) {
        return "undefined";
    }
    if (key === "matrixDetail") {
        return t(
            `QueryPage:Subfilters.matrixDetail.values.${replaceAll(
                value,
                ".",
                ""
            )}`
        );
    }
    return t(`QueryPage:FilterValues.${key}.${replaceAll(value, ".", "")}`);
}

function translateSubFilter(
    key: string,
    characteristicValue: string,
    t: TFunction
): string {
    const subFilterKey = replaceAll(key, ".", "-");

    const subFilterToTranslate = replaceAll(subFilterKey, ":", "");

    const subFilterValueKey = replaceAll(characteristicValue, ".", "-");
    const subFilterValuesToTranslate = replaceAll(subFilterValueKey, ":", "");

    return t(
        `QueryPage:Subfilters.${subFilterToTranslate}.values.${subFilterValuesToTranslate}`
    );
}

function translateCharacteristics(
    characteristics: Record<string, string>,
    microorganism: string,
    t: TFunction
): Record<string, string> {
    const translatedCharacteristics: Record<string, string> = {};
    Object.keys(characteristics).forEach((characteristic) => {
        if (genesCollection.includes(characteristic)) {
            translatedCharacteristics[characteristic] =
                characteristics[characteristic];
        } else if (characteristic === "spez") {
            let spezKey = "spez";
            if (microorganism === "Enterococcus spp.") {
                spezKey = "entero_spez";
            }
            if (microorganism === "Campylobacter spp.") {
                spezKey = "campy_spez";
            }
            translatedCharacteristics[spezKey] = translateSubFilter(
                spezKey,
                characteristics[characteristic],
                t
            );
        } else if (characteristic === "ampc_carba_phenotype") {
            let clientKey = "ampc_carba_phenotype";
            if (microorganism === "CARBA-E. coli") {
                clientKey = "carba_ampc_carba_phenotype";
            }
            if (microorganism === "ESBL/AmpC-E. coli") {
                clientKey = "esbl_ampc_carba_phenotype";
            }
            translatedCharacteristics[clientKey] = translateSubFilter(
                clientKey,
                characteristics[characteristic],
                t
            );
        } else {
            translatedCharacteristics[characteristic] = translateSubFilter(
                characteristic,
                characteristics[characteristic],
                t
            );
        }
    });
    return translatedCharacteristics;
}
export function adaptApiIsolatesService(
    data: DbCollection,
    t: TFunction
): DbCollection {
    const translatedIsolates: DbCollection = data.map(
        ({
            microorganism,
            samplingContext,
            matrix,
            federalState,
            samplingStage,
            origin,
            category,
            productionType,
            resistance,
            samplingYear,
            characteristics,
            matrixDetail,
        }) => ({
            microorganism: checkAndTranslate("microorganism", microorganism, t),
            samplingContext: checkAndTranslate(
                "samplingContext",
                samplingContext,
                t
            ),
            matrix: checkAndTranslate("matrix", matrix, t),
            federalState: checkAndTranslate("federalState", federalState, t),
            samplingStage: checkAndTranslate("samplingStage", samplingStage, t),
            origin: checkAndTranslate("origin", origin, t),
            category: checkAndTranslate("category", category, t),
            productionType: checkAndTranslate(
                "productionType",
                productionType,
                t
            ),
            resistance,
            samplingYear: checkAndTranslate("samplingYear", samplingYear, t),
            characteristics: translateCharacteristics(
                characteristics,
                microorganism,
                t
            ),
            matrixDetail: checkAndTranslate("matrixDetail", matrixDetail, t),
        })
    );
    return translatedIsolates;
}

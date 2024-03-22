import { FilterSelection } from "./Evaluations.model";

const maxPageSize = 250;

const microorganism = [
    "E_COLI",
    "CAMPYLOBACTER_SPP",
    "ESBL_AMPC_E_COLI",
    "LISTERIS_MONOCYTOGENES",
    "MRSA",
    "SALMONELLA_SPP",
    "STEC",
    "CARBA_E_COLI",
    "ENTEROCOCCUS_SPP",
];
const category = ["HUHN", "PUTE", "SCHWEIN", "RIND", "DIVERSE"];
const diagramType = [
    "MDR",
    "ERREGERCHARAK",
    "SUBSTANZ_GRAPH",
    "TREND_DIAGRAMM",
];
const productionType = [
    "LEGEHENNEN",
    "MASTHAEHNCHEN",
    "MASTKALB_JUNGRIND",
    "MASTRIND",
    "MASTPUTEN",
    "MASTSCHWEIN",
    "RIND",
    "ZUCHTHUEHNER_LEGE_UND_MASTLINIE",
    "MILCHRIND",
    "DIVERSE",
];
const matrix = [
    "BLINDDARMINHALT",
    "FRISCHES_FLEISCH",
    "HACKFLEISCH",
    "KOT_STAUB",
    "SCHLACHTKOERPER",
    "HALS_HAUT",
    "MILCH",
    "MULTIPLE",
];
const division = ["FUTTERMITTEL", "TIERE", "LEBENSMITTEL", "MULTIPLE"];
const initialFilterSelection: FilterSelection = {
    division,
    microorganism,
    category,
    productionType,
    matrix,
    diagramType,
};
export {
    category,
    diagramType,
    division,
    initialFilterSelection,
    matrix,
    maxPageSize,
    microorganism,
    productionType,
};

import { AmrsTableData } from "./InfoPage.model";

function createAmrTable(
    substanceClass: string,
    amrSubstance: string,
    cutOffOne: string,
    CutOffTwo: string,
    concentrationMin: string,
    concentrationMax: string
): AmrsTableData {
    return {
        substanceClass,
        amrSubstance,
        cutOffOne,
        CutOffTwo,
        concentrationMin,
        concentrationMax,
    };
}


function createAmrTableOneCutOff(
    substanceClass: string,
    amrSubstance: string,
    cutOff: string,
    concentrationMin: string,
    concentrationMax: string
): AmrsTableData {
    return {
        substanceClass,
        amrSubstance,
        cutOff,
        concentrationMin,
        concentrationMax,
    };
}

export const tableAmrEcoliSalmRows: AmrsTableData[] = [
    createAmrTable("Aminoglykoside", "Gentamicin", "2", "2", "0,5", "32"),
    createAmrTable("Amphenicole", "Chloramphenicol", "16", "16", "8", "128"),
    createAmrTable("Cephalosporine", "Cefotaxim", "0,5", "0,25", "0,25", "128"),
    createAmrTable(
        "(Fluor)chinolone",
        "Nalidixinsäure",
        "16",
        "16",
        "4",
        "128"
    ),
    createAmrTable(
        "(Fluor)chinolone",
        "Ciprofloxacin",
        "0,06",
        "0,06",
        "0,015",
        "8"
    ),
    createAmrTable("Aminopenicilline", "Ampicillin", "8", "8", "1", "64"),
    createAmrTable("Polymyxine", "Colistin", "2", "2", "1", "16"),
    createAmrTable(
        "Folatsynthesehemmer",
        "Sulfamethoxazol",
        "256 *",
        "64",
        "8",
        "1024"
    ),
    createAmrTable(
        "Folatsynthesehemmer",
        "Trimethoprim",
        "2",
        "2",
        "0,25",
        "32"
    ),
    createAmrTable("Tetrazykline", "Tetrazyklin", "8", "8", "2", "64"),
    createAmrTable("Azalide", "Azithromycin", "16 *", "16 *", "2", "64"),
    createAmrTable("Carbapeneme", "Meropenem", "0,125", "0,125", "0,03", "16"),
    createAmrTable("Glycilcycline", "Tigecyclin", "1", "1", "0,25", "8"),
];

export const tableAmrEcoliSalmTwoRows: AmrsTableData[] = [
    createAmrTable(
        "Cephalosporine",
        "Gentamicin",
        "0,125 *",
        "0,125",
        "0,06",
        "32"
    ),
    createAmrTable("Cephalosporine", "Cefotaxim", "0,5", "0,25", "0,25", "64"),
    createAmrTable(
        "Cephalosporine/beta Laktamase Hemmer Kombination",
        "Cefotaxim + Clavulansäure",
        "0,5 *",
        "0,25",
        "0,06",
        "64"
    ),
    createAmrTable("Cephalosporine", "Cefoxitin", "8", "8", "0,5", "64"),
    createAmrTable("Cephalosporine", "Ceftazidim", "2", "0,5", "0,25", "128"),
    createAmrTable(
        "Cephalosporine/beta Laktamase Hemmer Kombination",
        "Ceftazidim + Clavulansäure",
        "2 *",
        "0,5",
        "0,125",
        "128"
    ),
    createAmrTable(
        "Carbapeneme",
        "Ertapenem",
        "0,0625*",
        "0,0625*",
        "0,015",
        "2"
    ),
    createAmrTable("Carbapeneme", "Imipenem", "1", "0,5", "0,12", "16"),
    createAmrTable("Carbapeneme", "Meropenem", "0,125", "0,125", "0,03", "16"),
    createAmrTable("Carboxypenicilline", "Temocillin", "", "16", "0,5", "128"),
];

export const tableAmrCampyRows: AmrsTableData[] = [
    createAmrTableOneCutOff("Aminoglykoside", "Gentamicin", "2", "0,125", "16"),
    createAmrTableOneCutOff(
        "Aminoglykoside",
        "Streptomycin",
        "4",
        "0,25",
        "16"
    ),
    createAmrTableOneCutOff(
        "(Fluor)chinolone",
        "Nalidixinsäure",
        "16",
        "1",
        "64"
    ),
    createAmrTableOneCutOff(
        "(Fluor)chinolone",
        "Ciprofloxacin",
        "0,5",
        "0,125",
        "16"
    ),
    createAmrTableOneCutOff(
        "Tetrazykline",
        "Tetrazyklin",
        "1* / 2**",
        "0,5",
        "64"
    ),
    createAmrTableOneCutOff(
        "Makrolide",
        "CErythromycin",
        "4* / 8**",
        "1",
        "128"
    ),
];

export const tableAmrMrsaRows: AmrsTableData[] = [
    createAmrTableOneCutOff("Aminoglykoside", "Gentamicin", "2", "1", "16"),
    createAmrTableOneCutOff("Aminoglykoside", "Kanamycin", "8", "4", "64"),
    createAmrTableOneCutOff("Aminoglykoside", "Streptomycin", "16", "4", "32"),
    createAmrTableOneCutOff("Amphenicole", "Chloramphenicol", "16", "4", "64"),
    createAmrTableOneCutOff(
        "Fluorchinolone",
        "Ciprofloxacin",
        "1",
        "0,25",
        "8"
    ),
    createAmrTableOneCutOff("Penicilline", "Penicillin G", "0,12", "0,12", "2"),
    createAmrTableOneCutOff("Cephalosporine", "Cefoxitin", "4", "0,5", "16"),
    createAmrTableOneCutOff(
        "Folatsynthesehemmer",
        "Trimethoprim",
        "2",
        "2",
        "32"
    ),
    createAmrTableOneCutOff(
        "Sulfonamide",
        "Sulfamethoxazol",
        "128",
        "64",
        "512"
    ),
    createAmrTableOneCutOff("Tetrazykline", "Tetrazyklin", "1", "0,5", "16"),
    createAmrTableOneCutOff("Lincosamide", "Clindamycin", "0,25", "0,12", "4"),
    createAmrTableOneCutOff("Makrolide", "Erythromycin", "1", "0,25", "8"),
    createAmrTableOneCutOff(
        "Pseudomonische Säuren",
        "Mupirocin",
        "1",
        "0,5",
        "256"
    ),
    createAmrTableOneCutOff("Ansamycine", "Rifampicin", "0,03", "0,016", "0,5"),
    createAmrTableOneCutOff("Oxazolidinone", "Linezolid", "4", "1", "8"),
    createAmrTableOneCutOff(
        "Triterpensäuren",
        "Fusidinsäure",
        "0,5",
        "0,5",
        "4"
    ),
    createAmrTableOneCutOff(
        "Streptogramine",
        "Quinupristin / Dalfopristin",
        "1",
        "0,5",
        "4"
    ),
    createAmrTableOneCutOff("Pleuromutiline", "Tiamulin", "2", "0,5", "4"),
    createAmrTableOneCutOff("Glykopeptide", "Vancomycin", "2", "1", "16"),
];

export const tableAmrEfRows: AmrsTableData[] = [
    createAmrTable("Aminoglykoside", "Gentamicin", "32", "32", "8", "1024"),
    createAmrTable("Amphenicole", "Chloramphenicol", "32", "32", "4", "128"),
    createAmrTable("Fluorchinolone", "Ciprofloxacin", "4", "4", "0,12", "16"),
    createAmrTable("Aminopenicilline", "Ampicillin", "4", "4", "0,5", "64"),
    createAmrTable("Tetrazykline", "Tetrazyklin", "4", "4", "1", "128"),
    createAmrTable("Makrolide", "Erythromycin", "4", "4", "1", "128"),
    createAmrTable("Lipopeptide", "Daptomycin", "4", "4", "0,25", "32"),
    createAmrTable("Oxazolidinone", "Linezolid", "4", "4", "0,5", "64"),
    createAmrTable("Glycilcycline", "Tigecyclin", "0,25", "0,25", "0,03", "4"),
    createAmrTable("Glykopeptide", "Teicoplanin", "2", "2", "0,5", "64"),
    createAmrTable("Glykopeptide", "Vancomycin", "4", "4", "1", "128"),
];
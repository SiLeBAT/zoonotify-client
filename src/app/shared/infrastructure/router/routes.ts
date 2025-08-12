export const pageRoute = {
    homePagePath: "/",
    linkPagePath: "/links",
    infoPagePath: "/explanations",
    evaluationsPagePath: "/evaluations",
    dpdPagePath: "/dataProtectionDeclaration",
    linkedDataPagePath: "/ld",
    prevalencePagePath: "/prevalence",
    antimicrobialPagePath: "/antimicrobial",
    antibioticResistancePagePath: "/antibiotic-resistance",
    microbialCountsPagePath: "/microbial-counts",
};

const env = process.env.REACT_APP_ENV;
const cms = env === "qa" || env === "prod" ? "/cms" : "";

export const CMS_BASE_ENDPOINT = process.env.REACT_APP_API_URL;
export const CMS_API_ENDPOINT = `${CMS_BASE_ENDPOINT}/api`;
export const API_DOCUMENTATION_URL = `${CMS_BASE_ENDPOINT}${cms}/documentation/v2.2.0`;
export const CONFIGURATION = `${CMS_API_ENDPOINT}/configuration`;
export const WELCOME = `${CMS_API_ENDPOINT}/welcome`;
export const ANTIMICROBIALS = `${CMS_API_ENDPOINT}/antimicrobials`;
export const EXPLANATION = `${CMS_API_ENDPOINT}/explanations`;
export const EVALUATIONS = `${CMS_API_ENDPOINT}/evaluations`;
export const PREVALENCES = `${CMS_API_ENDPOINT}/prevalences`;
export const EVALUATION_INFO = `${CMS_API_ENDPOINT}/evaluation-information`;
export const PEREVALENCE_INFO = `${CMS_API_ENDPOINT}/prevalence-information`;
export const AMR_TABLE = `${CMS_API_ENDPOINT}/resistance-tables?populate[0]=cut_offs&populate[1]=cut_offs.antibiotic`;
export const EXTERNAL_LINKS = `${CMS_API_ENDPOINT}/externallinks`;
export const ISOLATES_LINKS = `${CMS_API_ENDPOINT}/isolates`;
export const INFORMATION = `${CMS_API_ENDPOINT}/informations`;
export const DATA_PROTECTION = `${CMS_API_ENDPOINT}/data-protection-declaration`;
export const SAMPLE_ORIGINS = `${CMS_API_ENDPOINT}/sample-origins`;
export const SUPER_CATEGORY_SAMPLE_ORIGINS = `${CMS_API_ENDPOINT}/super-category-sample-origins`;
export const MATRICES = `${CMS_API_ENDPOINT}/matrices`;
export const MATRIX_GROUPS = `${CMS_API_ENDPOINT}/matrix-groups`;
export const SAMPLING_STAGES = `${CMS_API_ENDPOINT}/sampling-stages`;
export const MICROORGANISMS = `${CMS_API_ENDPOINT}/microorganisms`;
export const RESISTANCES = `${CMS_API_ENDPOINT}/resistances`;
export const SPECIES = `${CMS_API_ENDPOINT}/species`;
export const TREND_INFORMATION = `${CMS_API_ENDPOINT}/trend-information`;
export const MICROBIAL_COUNTS = `${CMS_API_ENDPOINT}/microbial-counts`;
export const ANTIMICROBIAL_SUBSTANCES = `${CMS_API_ENDPOINT}/antimicrobial-substances`;

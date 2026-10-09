export const pageRoute = {
    homePagePath: "/",
    linkPagePath: "/links",
    infoPagePath: "/explanations",
    evaluationsPagePath: "/evaluations",
    dpdPagePath: "/dataProtectionDeclaration",
    prevalencePagePath: "/prevalence",
    antimicrobialPagePath: "/antimicrobial",
    antibioticResistancePagePath: "/antibiotic-resistance",
    microbialCountsPagePath: "/microbial-counts",
};

export const CMS_BASE_ENDPOINT = process.env.REACT_APP_API_URL;
export const CMS_API_ENDPOINT = `${CMS_BASE_ENDPOINT}/api`;
// Static Swagger UI page, built by cp:api-docs outside the SPA. Linked by file
// name: the deployed Apache's SPA fallback rewrites the bare directory URL to
// the app's index.html, which has no route for it and renders blank.
export const API_DOCUMENTATION_URL = "/assets/api-docs/index.html";

/**
 * Whether the footer links the API reference. A build hides it by setting
 * REACT_APP_API_REFERENCE_LINKED to "false": production does, until prod serves
 * every collection the reference promises (issue 037). Flip it at go-live.
 */
export function isApiReferenceLinked(value: string | undefined): boolean {
    return value?.trim() !== "false";
}
export const API_REFERENCE_LINKED = isApiReferenceLinked(
    process.env.REACT_APP_API_REFERENCE_LINKED
);
export const CONFIGURATION = `${CMS_API_ENDPOINT}/configuration`;
export const WELCOME = `${CMS_API_ENDPOINT}/welcome`;
export const AMU_PAGE = `${CMS_API_ENDPOINT}/amu-page`;
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
export const MULTI_RESISTANCES = `${CMS_API_ENDPOINT}/multi-resistances`;
export const SPECIES = `${CMS_API_ENDPOINT}/species`;
export const TREND_INFORMATION = `${CMS_API_ENDPOINT}/trend-information`;
export const SUBSTANCE_INFORMATION = `${CMS_API_ENDPOINT}/substance-information`;
export const MULTI_RESISTANCE_INFORMATION = `${CMS_API_ENDPOINT}/multi-resistance-information`;
export const AMR_PAGE = `${CMS_API_ENDPOINT}/amr-page`;
export const MICROBIAL_COUNTS = `${CMS_API_ENDPOINT}/microbial-counts`;
export const ANTIMICROBIAL_SUBSTANCES = `${CMS_API_ENDPOINT}/antimicrobial-substances`;

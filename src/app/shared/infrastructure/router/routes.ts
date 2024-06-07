export const pageRoute = {
    homePagePath: "/",
    linkPagePath: "/links",
    infoPagePath: "/explanations",
    evaluationsPagePath: "/evaluations",
    dpdPagePath: "/dataProtectionDeclaration",
    linkedDataPagePath: "/ld",
    prevalencePagePath: "/prevalence",
};

export const CMS_BASE_ENDPOINT = process.env.REACT_APP_API_URL;
export const CMS_API_ENDPOINT = CMS_BASE_ENDPOINT + `/api`;
export const API_DOCUMENTATION_URL =
    CMS_BASE_ENDPOINT + `/documentation/v2.2.0`;
export const CONFIGURATION = `${CMS_API_ENDPOINT}/configuration`;
export const WELCOME = `${CMS_API_ENDPOINT}/welcome`;
export const EXPLANATION = `${CMS_API_ENDPOINT}/explanations`;
export const EVALUATIONS = `${CMS_API_ENDPOINT}/evaluations`;
export const PREVALENCES = `${CMS_API_ENDPOINT}/prevalences`;
export const EVALUATION_INFO = `${CMS_API_ENDPOINT}/evaluation-information`;
export const AMR_TABLE = `${CMS_API_ENDPOINT}/resistance-tables?populate[0]=cut_offs&populate[1]=cut_offs.antibiotic`;
export const EXTERNAL_LINKS = `${CMS_API_ENDPOINT}/externallinks`;
export const ISOLATES_LINKS = `${CMS_API_ENDPOINT}/isolates`;
export const INFORMATION = `${CMS_API_ENDPOINT}/informations`;
export const DATA_PROTECTION = `${CMS_API_ENDPOINT}/data-protection-declaration`;

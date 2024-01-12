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
export const CONFIGURATION = `${CMS_API_ENDPOINT}/configuration`;
export const WELCOME = `${CMS_API_ENDPOINT}/welcome`;
export const EXPLANATION = `${CMS_API_ENDPOINT}/explanations`;
export const EVALUATIONS = `${CMS_API_ENDPOINT}/evaluations`;
export const EVALUATION_INFO = `${CMS_API_ENDPOINT}/evaluation-information`;
export const AMR_TABLE = `${CMS_API_ENDPOINT}/resistance-tables`;
export const EXTERNAL_LINKS = `${CMS_API_ENDPOINT}/externallinks`;
export const ISOLATES_LINKS = `${CMS_API_ENDPOINT}/isolates`;

export const pageRoute = {
    homePagePath: "/",
    linkPagePath: "/links",
    infoPagePath: "/explanations",
    evaluationsPagePath: "/evaluations",
    dpdPagePath: "/dataProtectionDeclaration",
};

export const CMS_BASE_ENDPOINT = `http://localhost:1337`;
export const CMS_API_ENDPOINT = CMS_BASE_ENDPOINT + `/api`;
export const CONFIGURATION = `${CMS_API_ENDPOINT}/configuration`;
export const WELCOME = `${CMS_API_ENDPOINT}/welcome`;
export const EVALUATIONS = `${CMS_API_ENDPOINT}/evaluations`;

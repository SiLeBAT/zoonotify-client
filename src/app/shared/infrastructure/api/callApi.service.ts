import { reportCmsAvailability } from "./cmsAvailability";

// eslint-disable-next-line @typescript-eslint/ban-types
export interface ApiResponse<T extends {}> {
    status: number;
    data?: T;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export async function callApiService<T extends {}>(
    apiUrl: string,
    options: RequestInit = {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    }
): Promise<ApiResponse<T>> {
    let apiResponse: Response;
    try {
        apiResponse = await fetch(apiUrl, options);
    } catch (error) {
        reportCmsAvailability(false);
        throw error;
    }
    // A 5xx is the CMS (or the Apache proxy in front of it, which answers
    // 502/503 while Strapi is down) failing, not a bad request. Callers get
    // the status back as before; only the outage notice reacts.
    reportCmsAvailability(apiResponse.status < 500);
    const cmsVersion = apiResponse.headers.get("cms-version");
    window.sessionStorage.setItem("cms-version", cmsVersion ? cmsVersion : "");
    // Only sent by QA deployments of the CMS.
    const cmsCommit = apiResponse.headers.get("cms-commit");
    window.sessionStorage.setItem("cms-commit", cmsCommit ? cmsCommit : "");
    const { status } = apiResponse;

    if (status === 200) {
        const data: T = await apiResponse.json();

        return {
            status,
            data,
        };
    }
    return { status };
}

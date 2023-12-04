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
    const apiResponse: Response = await fetch(apiUrl, options);
    const cmsVersion = apiResponse.headers.get("cms-version");
    window.sessionStorage.setItem("cms-version", cmsVersion ? cmsVersion : "");
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

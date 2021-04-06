export interface ApiResponse<T>{
    apiStatus: number;
    apiProp?: T;
}

export async function ApiService(apiUrl: string): Promise<ApiResponse<Record<string, unknown>[]>> {
    const apiResponse: Response = await fetch(apiUrl);

    const apiStatus = apiResponse.status;

    if (apiStatus === 200) {
        const apiProp: Record<string, unknown>[] = await apiResponse.json();

        return {
            apiStatus,
            apiProp,
        };
    }
    return { apiStatus };
}

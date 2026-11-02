import { useEffect, useState } from "react";
import { callApiService } from "../shared/infrastructure/api/callApi.service";

/**
 * The date of the last successful import, which the import CLI records in
 * the CMS's `data-import` single type as its final step. One import loads
 * every fact collection, so prevalence and AMR share this date.
 */
interface DataImportResponse {
    data?: { completedAt?: string };
}

/** Formats an ISO timestamp as DD.MM.YYYY, the format the CMS date used. */
export function formatDataUpdateDate(iso: string): string {
    const date = new Date(iso);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}.${date.getFullYear()}`;
}

/** DD.MM.YYYY of the last successful import, or null if none is recorded. */
export async function fetchDataUpdateDate(): Promise<string | null> {
    const url = `${process.env.REACT_APP_API_URL}/api/data-import`;
    const response = await callApiService<DataImportResponse>(url);
    const completedAt = response.data?.data?.completedAt;
    return completedAt ? formatDataUpdateDate(completedAt) : null;
}

export function useDataUpdateDate(): string | null {
    const [date, setDate] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        const load = async (): Promise<void> => {
            try {
                const result = await fetchDataUpdateDate();
                if (!cancelled) setDate(result);
            } catch (err) {
                console.error("Error fetching data update date:", err);
            }
        };
        void load();
        return () => {
            cancelled = true;
        };
    }, []);

    return date;
}

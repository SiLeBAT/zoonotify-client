import { useEffect, useState } from "react";
import i18next from "i18next";
import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { AMR_PAGE } from "../../shared/infrastructure/router/routes";

interface AmrPageDTO {
    id: number;
    documentId?: string;
    trendTooltip: string | null;
    substanceTooltip: string | null;
    multiTooltip: string | null;
    locale?: string;
}

interface AmrPageResponse {
    data: AmrPageDTO | null;
    meta: unknown;
}

export interface AmrPageTooltips {
    trendTooltip: string;
    substanceTooltip: string;
    multiTooltip: string;
}

export function useAmrPageTooltips(): AmrPageTooltips {
    const [tooltips, setTooltips] = useState<AmrPageTooltips>({
        trendTooltip: "",
        substanceTooltip: "",
        multiTooltip: "",
    });

    useEffect(() => {
        let cancelled = false;

        const fetchData = async (): Promise<void> => {
            const url = `${AMR_PAGE}?locale=${i18next.language}`;
            try {
                const resp = await callApiService<AmrPageResponse>(url);
                const item = resp.data?.data;
                if (cancelled) return;
                setTooltips({
                    trendTooltip: item?.trendTooltip ?? "",
                    substanceTooltip: item?.substanceTooltip ?? "",
                    multiTooltip: item?.multiTooltip ?? "",
                });
            } catch (err) {
                if (cancelled) return;
                console.error("AMR page tooltips fetch error:", err);
                setTooltips({
                    trendTooltip: "",
                    substanceTooltip: "",
                    multiTooltip: "",
                });
            }
        };

        fetchData();
        return (): void => {
            cancelled = true;
        };
    }, [i18next.language]);

    return tooltips;
}

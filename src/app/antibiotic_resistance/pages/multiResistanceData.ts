import { callApiService } from "../../shared/infrastructure/api/callApi.service";
import { MULTI_RESISTANCES } from "../../shared/infrastructure/router/routes";
import type { MultiResistanceItem } from "./multiResistanceHelpers";
import { buildMicroorganismFilter } from "./resistanceHelpers";

/**
 * The one seam for Multi-resistance data: every row of one microorganism, in
 * one locale, with its relations populated. Rejects on a non-200 answer (e.g.
 * the Public role lacks `find` on `multi-resistance`).
 */
export async function fetchMultiResistance(
    microorganism: string,
    locale: string
): Promise<MultiResistanceItem[]> {
    const url =
        `${MULTI_RESISTANCES}?locale=${locale}` +
        buildMicroorganismFilter(microorganism) +
        `&populate=*&pagination[pageSize]=8000`;
    const res = await callApiService<{ data?: MultiResistanceItem[] }>(url);
    if (res.status !== 200) {
        throw new Error(`multi-resistances request failed: ${res.status}`);
    }
    return res.data?.data ?? [];
}

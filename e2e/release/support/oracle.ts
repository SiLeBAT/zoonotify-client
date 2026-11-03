import { APIRequestContext, expect } from "@playwright/test";

/**
 * The oracle: expected values are read live from the site's own public API
 * (`${E2E_BASE_URL}/api/...`) and the locale JSON, never pinned. QA and prod
 * hold different data.
 */

export type Locale = "en" | "de";

/** Page sizes the client asks for; a result larger than this is silently cut. */
export const PAGE_SIZE = { prevalence: 900, resistances: 8000 } as const;

export function apiBase(): string {
    const base = process.env.E2E_BASE_URL;
    if (!base) throw new Error("E2E_BASE_URL is required for release checks");
    return `${base.replace(/\/+$/, "")}/api`;
}

/** Appends query parameters to a path that may or may not already carry some. */
function withQuery(
    path: string,
    params: Record<string, string | number>
): string {
    const query = Object.entries(params)
        .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
        .join("&");
    return query ? `${path}${path.includes("?") ? "&" : "?"}${query}` : path;
}

/** GET `/api<path>` (path starts with `/`), optionally in a locale; expects 200. */
export async function apiGet(
    request: APIRequestContext,
    path: string,
    locale?: Locale
): Promise<any> {
    const url = `${apiBase()}${locale ? withQuery(path, { locale }) : path}`;
    const response = await request.get(url);
    expect(response.status(), `GET ${url}`).toBe(200);
    return response.json();
}

/**
 * Truncation guard: the client asks for one page of `pageSize` rows and never
 * pages on, so a collection that outgrows it makes the site show less than the
 * API holds. Fail loudly instead of comparing against a cut-off oracle.
 */
export function assertNotTruncated(total: number, pageSize: number): void {
    expect(
        total,
        `the API holds ${total} rows but the client fetches only ${pageSize}`
    ).toBeLessThanOrEqual(pageSize);
}

/**
 * GET a collection the way the client does (one page of `pageSize`) and apply
 * the truncation guard. Returns the `data` array.
 */
export async function apiGetAll(
    request: APIRequestContext,
    path: string,
    pageSize: number,
    locale?: Locale
): Promise<any[]> {
    const json = await apiGet(
        request,
        withQuery(path, { "pagination[pageSize]": pageSize }),
        locale
    );
    assertNotTruncated(json.meta.pagination.total, pageSize);
    return json.data;
}

/**
 * Whitespace-normalised name. CMS names can hold double spaces; the browser
 * collapses them, so compare names only after both sides went through this.
 */
export function normalise(name: string): string {
    return name.replace(/\s+/g, " ").trim();
}

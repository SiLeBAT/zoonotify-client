import { APIRequestContext, TestInfo } from "@playwright/test";
import { reportOutcome } from "./annotations";

/** The only `*.bfr.berlin` host production pages may link to. */
export const PROD_HOST = "zoonotify.bfr.berlin";

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * Dev rule (apply on prod only): no link may lead to a development host.
 * Any `*.bfr.berlin` host must be exactly `zoonotify.bfr.berlin`; `localhost`
 * and IP hosts always fail. Returns the offending hrefs; `mailto:` and
 * relative links are not hosts and are ignored.
 */
export function devRuleViolations(hrefs: string[]): string[] {
    return hrefs.filter((href) => {
        let url: URL;
        try {
            url = new URL(href, `https://${PROD_HOST}`);
        } catch {
            return false;
        }
        if (url.protocol !== "http:" && url.protocol !== "https:") return false;
        const host = url.hostname;
        if (host === "localhost" || IPV4.test(host) || host.startsWith("[")) {
            return true;
        }
        return host.endsWith(".bfr.berlin") && host !== PROD_HOST;
    });
}

export type LinkVerdict = "ok" | "fail" | "could-not-verify";

const DNS_FAILURE = /ENOTFOUND|EAI_AGAIN|ERR_NAME_NOT_RESOLVED|getaddrinfo/i;

/**
 * External link rule: only 404, 410 and DNS failure fail. Any other non-2xx/3xx
 * answer, or a timeout / connection error, is "could not verify": the other
 * site may simply refuse robots.
 * Pass a status for an answer, or an error message when there was none.
 */
export function classifyLink(
    answer: { status: number } | { error: string }
): LinkVerdict {
    if ("error" in answer) {
        return DNS_FAILURE.test(answer.error) ? "fail" : "could-not-verify";
    }
    const { status } = answer;
    if (status >= 200 && status < 400) return "ok";
    return status === 404 || status === 410 ? "fail" : "could-not-verify";
}

export interface LinkResult {
    url: string;
    verdict: LinkVerdict;
    detail: string;
}

async function probe(
    request: APIRequestContext,
    url: string
): Promise<{ verdict: LinkVerdict; detail: string }> {
    try {
        const response = await request.get(url, {
            timeout: 20_000,
            failOnStatusCode: false,
        });
        return {
            verdict: classifyLink({ status: response.status() }),
            detail: `HTTP ${response.status()}`,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
            verdict: classifyLink({ error: message }),
            detail: message.split("\n")[0],
        };
    }
}

/**
 * Requests each external URL (retrying once when it is not ok) and applies the
 * external link rule. Every "could not verify" is recorded on the test with
 * `reportOutcome`, so the test stays green and the report says why it is not a
 * plain pass. The caller asserts that no result has verdict "fail".
 */
export async function checkExternalLinks(
    request: APIRequestContext,
    urls: string[],
    testInfo: TestInfo
): Promise<LinkResult[]> {
    const results: LinkResult[] = [];
    for (const url of urls) {
        let attempt = await probe(request, url);
        if (attempt.verdict !== "ok") attempt = await probe(request, url);
        if (attempt.verdict === "could-not-verify") {
            reportOutcome(
                testInfo,
                "could-not-verify",
                `${url} (${attempt.detail})`
            );
        }
        results.push({ url, ...attempt });
    }
    return results;
}

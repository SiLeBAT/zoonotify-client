import { APIRequestContext, expect, Page, test } from "@playwright/test";
import { visit } from "../support/app";
import { releaseCheck } from "./support/annotations";
import {
    FILTER_LABELS,
    FilterKey,
    resistanceRows,
} from "./support/amr-filters";
import { checkExternalLinks, devRuleViolations } from "./support/links";
import { LANGUAGES } from "./support/locales";
import type { Related } from "./support/prevalence-api";
import {
    apiBase,
    apiGet,
    apiGetAll,
    Locale,
    normalise,
    PAGE_SIZE,
} from "./support/oracle";
import {
    ExampleQuery,
    Lang,
    LookupEntry,
    Options,
    parseExampleQuery,
    rebaseToSite,
    textNamesOrganism,
    unresolvedFilters,
} from "./support/welcome-links";
import { currentTarget } from "./targets";

// Resolved inside each test: release specs are also loaded by runs that set
// no E2E_TARGET (the QA smoke job), and must not throw while being collected.

interface WelcomeLink {
    text: string;
    href: string;
}

/** Every `a[href]` the rendered welcome page offers, in the given language. */
async function welcomeLinks(page: Page, lang: Lang): Promise<WelcomeLink[]> {
    await visit(page, `/?lang=${lang}`);
    const anchors = page.getByRole("main").locator("a[href]");
    await expect(anchors.first(), "the welcome page renders links").toBeVisible(
        { timeout: 30_000 }
    );
    return anchors.evaluateAll((nodes) =>
        nodes.map((node) => ({
            text: (node.textContent ?? "").replace(/\s+/g, " ").trim(),
            href: node.getAttribute("href") ?? "",
        }))
    );
}

/**
 * welcome.links: the welcome page's external links answer, and production
 * links to no development host. Example queries into the app itself belong
 * to welcome.example-queries.
 */
for (const lang of LANGUAGES) {
    test(
        `welcome page links, ${lang}`,
        {
            tag: "@post-release",
            annotation: releaseCheck("welcome.links", { lang }),
        },
        async ({ page, request }, testInfo) => {
            test.skip(currentTarget().name !== "prod", "post-release only");
            const links = await welcomeLinks(page, lang);
            const hrefs = [...new Set(links.map((l) => l.href))];

            if (currentTarget().name === "prod") {
                expect(devRuleViolations(hrefs), "dev rule").toEqual([]);
            }

            const siteHost = new URL(apiBase()).host;
            const external = hrefs.filter(
                (href) =>
                    /^https?:/.test(href) &&
                    ![siteHost, "zoonotify.bfr.berlin"].includes(
                        new URL(href).host
                    )
            );
            expect(external, "the welcome page links outward").not.toEqual([]);

            const results = await checkExternalLinks(
                request,
                external,
                testInfo
            );
            expect(
                results.filter((r) => r.verdict === "fail"),
                "broken external links"
            ).toEqual([]);
        }
    );
}

// ---------------------------------------------------------------------------
// welcome.example-queries
// ---------------------------------------------------------------------------

const PREVALENCE_LOOKUPS: Record<string, string> = {
    microorganism: "/microorganisms",
    sampleOrigin: "/sample-origins",
    matrix: "/matrices",
    samplingStage: "/sampling-stages",
    matrixGroup: "/matrix-groups",
    superCategorySampleOrigin: "/super-category-sample-origins",
};

const AMR_RELATIONS = Object.keys(FILTER_LABELS) as FilterKey[];

/** The options the client would offer for a query, read live from the API. */
class OptionSource {
    private cache = new Map<string, Promise<Options>>();

    constructor(private request: APIRequestContext) {}

    for(query: ExampleQuery): Promise<Options> {
        const id = `${query.kind}|${query.lang}|${
            query.kind === "amr" ? query.organism : ""
        }`;
        let options = this.cache.get(id);
        if (!options) {
            options =
                query.kind === "prevalence"
                    ? this.prevalence(query.lang)
                    : this.amr(query.lang, query.organism ?? "");
            this.cache.set(id, options);
        }
        return options;
    }

    private async prevalence(lang: Locale): Promise<Options> {
        const options: Options = {};
        for (const [key, path] of Object.entries(PREVALENCE_LOOKUPS)) {
            const rows = await apiGetAll<Related>(
                this.request,
                path,
                PAGE_SIZE.prevalence,
                lang
            );
            options[key] = rows.map(({ name, documentId }) => ({
                name,
                documentId,
            }));
        }
        return options;
    }

    private async amr(lang: Locale, organism: string): Promise<Options> {
        const rows = await resistanceRows(this.request, organism, lang);
        const options: Options = {};
        for (const key of AMR_RELATIONS) {
            const byId = new Map<string, LookupEntry>();
            for (const row of rows) {
                const rel = row[key];
                if (rel?.documentId && rel?.name) {
                    byId.set(rel.documentId, {
                        name: rel.name,
                        documentId: rel.documentId,
                    });
                }
            }
            options[key] = [...byId.values()];
        }
        return options;
    }
}

/** Opens the query and asserts a non-empty result that names the organism. */
async function assertResult(
    page: Page,
    href: string,
    query: ExampleQuery,
    organismName: string | undefined
): Promise<void> {
    await visit(page, href);
    const main = page.getByRole("main");
    if (query.kind === "prevalence") {
        await expect
            .poll(() => page.getByRole("row").count(), {
                message: "the prevalence table has rows",
                timeout: 30_000,
            })
            .toBeGreaterThan(1);
    } else {
        await expect(main, "the graph shows tested isolates").toContainText(
            /N\s*=\s*[1-9]\d*/,
            { timeout: 30_000 }
        );
    }
    if (organismName) {
        await expect(main, "the page names the organism").toContainText(
            normalise(organismName)
        );
    }
}

/** Returns one message per failing example query on the rendered welcome page. */
async function exampleQueryFailures(
    page: Page,
    request: APIRequestContext,
    lang: Lang
): Promise<string[]> {
    const links = await welcomeLinks(page, lang);
    const queries = links
        .map((link) => ({ link, query: parseExampleQuery(link.href, lang) }))
        .filter(
            (entry): entry is { link: WelcomeLink; query: ExampleQuery } =>
                // a link without filters ("prevalence graphs are found here")
                // is navigation, not an example query
                entry.query !== null && entry.query.filters.length > 0
        );
    if (queries.length === 0) {
        return [
            `no prevalence or antibiotic-resistance links on the ${lang} welcome page`,
        ];
    }

    const source = new OptionSource(request);
    const failures: string[] = [];
    for (const { link, query } of queries) {
        const label = `"${link.text}" (${lang})`;
        const options = await source.for(query);
        const unresolved = unresolvedFilters(query.filters, options);
        if (unresolved.length > 0) {
            failures.push(
                `${label}: unresolved ${unresolved
                    .map((f) => `${f.key}=${f.value}`)
                    .join("; ")}`
            );
            continue;
        }

        const organismName =
            query.kind === "prevalence"
                ? options.microorganism?.find(
                      (o) =>
                          o.name === query.organism ||
                          o.documentId === query.organism
                  )?.name
                : query.organism;
        if (organismName && !textNamesOrganism(link.text, organismName)) {
            failures.push(
                `${label}: link text does not name the organism ${organismName}`
            );
            continue;
        }

        try {
            await assertResult(
                page,
                rebaseToSite(link.href, apiBase()),
                query,
                organismName
            );
        } catch (error) {
            const message = error instanceof Error ? error.message : `${error}`;
            failures.push(`${label}: ${message.split("\n")[0]}`);
        }
    }
    return failures;
}

for (const lang of LANGUAGES) {
    test(
        `welcome page example queries, ${lang}`,
        {
            tag: "@post-release",
            annotation: releaseCheck("welcome.example-queries", { lang }),
        },
        async ({ page, request }) => {
            test.skip(currentTarget().name !== "prod", "post-release only");
            test.setTimeout(300_000);
            expect(
                await exampleQueryFailures(page, request, lang),
                "failing example queries"
            ).toEqual([]);
        }
    );
}

// The check must fail a stale documentId and pass a name-based link; proven
// on a welcome page the test writes itself.
test("self-test: example queries fail a stale documentId and pass a name", async ({
    page,
    request,
}) => {
    test.setTimeout(120_000);
    const row = (
        await apiGet(
            request,
            "/prevalences?populate=microorganism&pagination[pageSize]=1",
            "en"
        )
    ).data[0];
    const name: string = row.microorganism.name;
    const site = "https://zoonotify.bfr.berlin/prevalence";
    const content = [
        `- [Prevalence of ${name} by name](${site}?microorganism=${encodeURIComponent(
            name
        )}&lang=en)`,
        `- [Prevalence of ${name} by id](${site}?microorganism=stale0documentid0xxxxxxx&lang=en)`,
    ].join("\n");
    await page.route("**/api/welcome*", async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        json.data.content = content;
        await route.fulfill({ response, json });
    });

    const failures = await exampleQueryFailures(page, request, "en");
    expect(failures).toEqual([
        expect.stringContaining(
            `"Prevalence of ${name} by id" (en): unresolved microorganism=stale0documentid0xxxxxxx`
        ),
    ]);
});

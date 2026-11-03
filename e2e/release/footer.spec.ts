import { expect, test } from "@playwright/test";
import {
    API_DOCUMENTATION_URL,
    pageRoute,
} from "../../src/app/shared/infrastructure/router/routes";
import { visit } from "../support/app";
import { releaseCheck } from "./support/annotations";
import { LANGUAGES, LOCALES } from "./support/locales";
import { checkExternalLinks, devRuleViolations } from "./support/links";
import { apiGet } from "./support/oracle";
import { currentTarget } from "./targets";

const target = currentTarget();

/**
 * footer.links: every footer link goes where the code says (the one place
 * hrefs are pinned), the mail link uses the CMS's support address, external
 * links answer, and production links to no development host.
 */
for (const lang of LANGUAGES) {
    const footer = LOCALES[lang].footer;
    test(
        `footer links, ${lang}`,
        {
            tag: "@post-release",
            annotation: releaseCheck("footer.links", { lang }),
        },
        async ({ page, request }, testInfo) => {
            const { supportEmail } = (await apiGet(request, "/configuration"))
                .data;
            expect(supportEmail, "the CMS holds a support email").toBeTruthy();

            await visit(page, `/?lang=${lang}`);
            const links = page.getByRole("contentinfo").getByRole("link");

            const expected: Record<string, string> = {
                [footer.Content.Bfr]: "https://www.bfr.bund.de/en/home.html",
                "FoodRisk-Labs":
                    "https://foodrisklabs.bfr.bund.de/foodrisk-labs/",
                [footer.Content.DataProtection]: pageRoute.dpdPagePath,
                [footer.Content
                    .Mail]: `mailto:${supportEmail}?subject=ZooNotify-Problem`,
            };
            if (target.apiReferenceLinked) {
                expected[footer.Content.Api] = API_DOCUMENTATION_URL;
            }

            await expect(links).toHaveCount(Object.keys(expected).length);
            const actual = await links.evaluateAll((nodes) =>
                nodes.map((node) => [
                    node.textContent?.trim() ?? "",
                    node.getAttribute("href") ?? "",
                ])
            );
            expect(Object.fromEntries(actual)).toEqual(expected);

            const hrefs = actual.map(([, href]) => href);
            if (target.name === "prod") {
                expect(devRuleViolations(hrefs), "dev rule").toEqual([]);
            }

            const external = hrefs.filter((href) => /^https?:/.test(href));
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

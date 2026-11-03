import {
    APIRequestContext,
    expect,
    Locator,
    Page,
    test,
} from "@playwright/test";
import infoDe from "../../src/locales/de/InfoPage.json";
import infoEn from "../../src/locales/en/InfoPage.json";
import { visit } from "../support/app";
import { releaseCheck } from "./support/annotations";
import { apiGet, Locale, normalise } from "./support/oracle";

/**
 * explanation.cut-off-table: for each of the seven cut-off tables on the
 * explanation page, in both languages, the dialog shows the headers from the
 * locale file, the latest year the CMS holds as its first year column, and
 * every cell equal to `/api/resistance-tables`. The title is `Table <id>:
 * <title>` with no doubled prefix; that rule is red on production for tables 4,
 * 5a and 5b until issue 119 is fixed.
 */

const TABLES = [
    { id: "1", name: "E. coli" },
    { id: "2", name: "Salmonella" },
    { id: "3a", name: "C. jejuni" },
    { id: "3b", name: "C. coli" },
    { id: "4", name: "MRSA" },
    { id: "5a", name: "E. faecalis" },
    { id: "5b", name: "E. faecium" },
] as const;

const LOCALES = { de: infoDe, en: infoEn } as const;

interface CutOff {
    year: number;
    min: number | null;
    max: number | null;
    cutOff: number | null;
    antibiotic: { shortName: string } | null;
}

interface ResistanceTable {
    table_id: string;
    title: string;
    cut_offs: CutOff[];
}

async function oracleTable(
    request: APIRequestContext,
    tableId: string,
    locale: Locale
): Promise<ResistanceTable> {
    const json = await apiGet(
        request,
        "/resistance-tables?populate=cut_offs.antibiotic",
        locale
    );
    const table = (json.data as ResistanceTable[]).find(
        (t) => t.table_id === tableId
    );
    expect(
        table,
        `table ${tableId} exists in the CMS (${locale})`
    ).toBeTruthy();
    return table as ResistanceTable;
}

/** Title of the section holding the table links: the explanation whose text has `<table id=`. */
async function sectionTitle(
    request: APIRequestContext,
    locale: Locale
): Promise<string> {
    const json = await apiGet(request, "/explanations", locale);
    const section = (
        json.data as { title: string; description: string }[]
    ).find((e) => /<table\s+id=/.test(e.description ?? ""));
    expect(
        section,
        `an explanation section holds the tables (${locale})`
    ).toBeTruthy();
    return section!.title;
}

/** Expands the section, opens the table's dialog and returns its pieces. */
async function openTable(
    page: Page,
    request: APIRequestContext,
    lang: Locale,
    tableId: string
): Promise<{ dialog: Locator; grid: Locator }> {
    const section = await sectionTitle(request, lang);
    await visit(page, `/explanations?lang=${lang}`);
    await page
        .getByRole("button", { name: normalise(section), exact: true })
        .click({ timeout: 30_000 });
    const opener = page.locator(`button[id="${tableId}"]`);
    await expect(opener).toBeVisible({ timeout: 30_000 });
    // The page reads the table id from the click target or its parent; the
    // button centre can land on a deeper child, so click near its corner.
    await opener.click({ position: { x: 4, y: 4 } });
    const dialog = page.getByRole("dialog");
    const grid = dialog.getByRole("table", { name: "amr-table" });
    await expect(grid).toBeVisible();
    return { dialog, grid };
}

const cell = (value: number | null | undefined): string =>
    value === null || value === undefined ? "" : String(value);

/** Headers and every cell of every year equal the API; throws on the first difference. */
async function expectTableMatchesApi(
    grid: Locator,
    table: ResistanceTable,
    lang: Locale
): Promise<void> {
    const rows = table.cut_offs.filter((c) => c.antibiotic);
    const years = [...new Set(rows.map((c) => c.year))].sort((a, b) => b - a);
    expect(years.length, "the table holds cut-offs").toBeGreaterThan(0);
    const amrs = LOCALES[lang].Methods.Amrs;

    // The first year column is the latest year the CMS holds.
    const headers = await grid
        .locator("thead tr")
        .first()
        .locator("th")
        .allInnerTexts();
    expect(headers.map((h) => h.trim())).toEqual([
        amrs.TableHeaderShortSub,
        amrs.TableHeaderClass,
        amrs.TableHeaderSubstance,
        ...years.map(String),
    ]);
    const subHeaders = await grid
        .locator("thead tr")
        .nth(1)
        .locator("th")
        .allInnerTexts();
    expect(
        subHeaders.slice(3).map((h) => h.trim()),
        "sub-headers per year"
    ).toEqual(years.flatMap(() => ["Max", "Min", "Cut-off"]));

    const want = new Map<string, string[]>();
    for (const c of rows) {
        const name = c.antibiotic!.shortName;
        if (!want.has(name))
            want.set(
                name,
                years.flatMap(() => ["", "", ""])
            );
        const at = years.indexOf(c.year) * 3;
        want.get(name)!.splice(at, 3, cell(c.max), cell(c.min), cell(c.cutOff));
    }
    const body = await grid
        .locator("tbody tr")
        .evaluateAll((trs) =>
            trs.map((tr) =>
                Array.from(tr.querySelectorAll("td")).map(
                    (td) => td.textContent?.trim() ?? ""
                )
            )
        );
    const seen = new Map(body.map((cells) => [cells[0], cells.slice(3)]));
    expect(body.length, "no duplicate substance rows").toBe(seen.size);
    expect(Object.fromEntries(seen)).toEqual(Object.fromEntries(want));
}

for (const lang of ["de", "en"] as const) {
    for (const { id, name } of TABLES) {
        test(
            `cut-off table ${id} (${name}), ${lang} @post-release`,
            {
                tag: "@post-release",
                annotation: releaseCheck("explanation.cut-off-table", {
                    table: id,
                    lang,
                }),
            },
            async ({ page, request }) => {
                const table = await oracleTable(request, id, lang);
                const { dialog, grid } = await openTable(
                    page,
                    request,
                    lang,
                    id
                );

                // Soft: a wrong title must not hide a wrong cell. The title is
                // Markdown, so emphasis marks are not in the rendered text.
                const title = normalise(
                    await dialog.getByRole("heading").first().innerText()
                );
                expect
                    .soft(title, "dialog title")
                    .toBe(
                        normalise(
                            `Table ${id}: ${table.title}`.replace(/[*_]/g, "")
                        )
                    );
                expect
                    .soft(
                        table.title,
                        "CMS title must not repeat the table prefix"
                    )
                    .not.toMatch(/^\s*(Table|Tabelle)\s+\w+\s*:/i);

                await expectTableMatchesApi(grid, table, lang);
            }
        );
    }
}

test("cut-off table check fails on a changed cut-off value", async ({
    page,
    request,
}) => {
    const lang = "en";
    const id = TABLES[1].id;
    const table = await oracleTable(request, id, lang);
    await page.route("**/api/resistance-tables*", async (route) => {
        const response = await route.fetch();
        const json = await response.json();
        const mine = json.data.find(
            (t: ResistanceTable) => t.table_id === id
        ) as ResistanceTable;
        mine.cut_offs[0].cutOff = (mine.cut_offs[0].cutOff ?? 0) + 1;
        await route.fulfill({ response, json });
    });
    const { grid } = await openTable(page, request, lang, id);
    await expect(expectTableMatchesApi(grid, table, lang)).rejects.toThrow();
});

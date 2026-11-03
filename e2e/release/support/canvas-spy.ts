import type { Page } from "@playwright/test";
import { italicWords } from "../../../src/app/prevalence/components/utils";

/**
 * The canvas spy: the prevalence figure is a Chart.js canvas with no DOM text,
 * so a test records what is drawn instead. An init script wraps
 * `CanvasRenderingContext2D.fillText` (text and the `ctx.font` it was drawn
 * with) and `clearRect` (a full clear starts a new render pass). Test-only: it
 * runs in the test's browser and changes nothing in the product.
 *
 * Two kinds of canvas matter: the one on the page (connected to the document)
 * and the off-screen one the figure download draws on (never connected).
 */
export interface Draw {
    text: string;
    font: string;
    /** Render pass the draw belongs to; ascending over the page's lifetime. */
    pass: number;
    /** Whether the canvas is part of the document (the visible chart). */
    onScreen: boolean;
    width: number;
    height: number;
}

declare global {
    interface Window {
        __canvasDraws?: Draw[];
    }
}

/** Installs the spy before the page's scripts run; call before `goto`. */
export async function installCanvasSpy(page: Page): Promise<void> {
    await page.addInitScript(() => {
        const draws: Draw[] = [];
        window.__canvasDraws = draws;
        let pass = 0;
        const proto = CanvasRenderingContext2D.prototype;
        const fillText = proto.fillText;
        const clearRect = proto.clearRect;
        proto.clearRect = function (x, y, w, h) {
            const canvas = this.canvas;
            if (x === 0 && y === 0 && w >= canvas.width && h >= canvas.height) {
                pass += 1;
            }
            return clearRect.call(this, x, y, w, h);
        };
        proto.fillText = function (text, x, y, maxWidth) {
            draws.push({
                text: String(text),
                font: this.font,
                pass,
                onScreen: this.canvas.isConnected,
                width: this.canvas.width,
                height: this.canvas.height,
            });
            return maxWidth === undefined
                ? fillText.call(this, text, x, y)
                : fillText.call(this, text, x, y, maxWidth);
        };
    });
}

/** Everything drawn so far. */
export async function recordedDraws(page: Page): Promise<Draw[]> {
    return page.evaluate(() => window.__canvasDraws ?? []);
}

/** Forgets what was drawn so far, so the next read shows only later draws. */
export async function clearDraws(page: Page): Promise<void> {
    await page.evaluate(() => {
        if (window.__canvasDraws) window.__canvasDraws.length = 0;
    });
}

/**
 * The draws of the most recent render pass of the canvases `onScreen` selects.
 * One pass is one complete picture; earlier passes may show a previous state.
 */
export function latestPass(draws: Draw[], onScreen: boolean): Draw[] {
    const candidates = draws.filter((d) => d.onScreen === onScreen);
    if (candidates.length === 0) return [];
    const last = Math.max(...candidates.map((d) => d.pass));
    return candidates.filter((d) => d.pass === last);
}

/** The font the chart title is drawn in (`customTitlePlugin` in ChartCard). */
const TITLE_FONT = /\b19px Arial$/;

/** Whether a canvas font string is italic. */
export function isItalic(font: string): boolean {
    return /(^|\s)italic(\s|$)/.test(font);
}

export interface TitleWord {
    text: string;
    italic: boolean;
}

/**
 * What the title should look like for an organism name: split on blanks and
 * hyphens (kept as parts); a part is italic when it contains a word of the
 * hard-coded italic list. That list is the one place the rule is pinned.
 */
export function expectedTitleWords(name: string): TitleWord[] {
    return name
        .split(/([-\s])/)
        .filter((part) => part.length > 0)
        .map((text) => ({
            text,
            italic:
                text.trim() !== "" &&
                text !== "-" &&
                italicWords.some((w) =>
                    text.toLowerCase().includes(w.toLowerCase())
                ),
        }));
}

/** Whether the organism name has any part the rules set in italic. */
export function hasItalicWord(name: string): boolean {
    return expectedTitleWords(name).some((w) => w.italic);
}

/**
 * Compares the title drawn in a pass with the organism name: the same parts in
 * order, each italic exactly when the italic list says so. Returns
 * human-readable problems; empty when the title is right.
 */
export function titleProblems(pass: Draw[], name: string): string[] {
    const drawn = pass.filter((d) => TITLE_FONT.test(d.font));
    const drawnText = drawn.map((d) => d.text).join("");
    if (drawnText !== name) {
        return [
            `title reads ${JSON.stringify(
                drawnText
            )}, expected ${JSON.stringify(name)}`,
        ];
    }
    const problems: string[] = [];
    expectedTitleWords(name).forEach((word, i) => {
        const font = drawn[i]?.font ?? "";
        if (isItalic(font) !== word.italic) {
            problems.push(
                `"${word.text}" should be ${
                    word.italic ? "italic" : "upright"
                } but is drawn in "${font}"`
            );
        }
    });
    return problems;
}

/** Four-digit strings drawn in a pass: the year axis labels. */
export function drawnYears(pass: Draw[]): number[] {
    return pass
        .map((d) => d.text)
        .filter((t) => /^\d{4}$/.test(t))
        .map(Number);
}

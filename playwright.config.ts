import { defineConfig, devices } from "@playwright/test";

/**
 * Where the suite points. Unset, it drives a dev server Playwright starts and
 * owns; set, it drives a server someone else owns (a deployed QA build, or a
 * dev server you already have running) and starts nothing.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:8080";
const ownsServer = process.env.E2E_BASE_URL === undefined;

export default defineConfig({
    testDir: "./e2e",
    // jest owns src/**, playwright owns e2e/**. jest's testPathIgnorePatterns
    // carries the other half of that split -- its testRegex matches `.spec.ts`
    // too, so without it jest would try to run these and choke on the import.
    testMatch: "**/*.spec.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: process.env.CI
        ? [["github"], ["html", { open: "never" }]]
        : [["list"], ["html", { open: "never" }]],
    use: {
        baseURL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: ownsServer
        ? {
              command: "npm run start:e2e",
              url: baseURL,
              // ts-loader type-checks the whole app before the first byte is
              // served, so a cold boot is minutes rather than seconds.
              timeout: 300_000,
              reuseExistingServer: !process.env.CI,
              stdout: "pipe",
              stderr: "pipe",
          }
        : undefined,
});

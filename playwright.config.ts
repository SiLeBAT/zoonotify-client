import {
    defineConfig,
    devices,
    type ReporterDescription,
} from "@playwright/test";

/**
 * Where the suite points. Unset, it drives a dev server Playwright starts and
 * owns; set, it drives a server someone else owns (a deployed QA build, or a
 * dev server you already have running) and starts nothing.
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:8080";
const ownsServer = process.env.E2E_BASE_URL === undefined;

/**
 * Production is the live site real users are on: the post-release run goes
 * easy on it (two workers, one retry) and says who it is, so the web server's
 * logs can tell it from traffic.
 */
const isProd = process.env.E2E_TARGET === "prod";
const PROD_USER_AGENT_SUFFIX = "ZooNotify-release-check";
const desktopChrome = {
    ...devices["Desktop Chrome"],
    ...(isProd
        ? {
              userAgent: `${devices["Desktop Chrome"].userAgent} ${PROD_USER_AGENT_SUFFIX}`,
          }
        : {}),
};

export default defineConfig({
    testDir: "./e2e",
    // jest owns src/**, playwright owns e2e/**. jest's testPathIgnorePatterns
    // carries the other half of that split -- its testRegex matches `.spec.ts`
    // too, so without it jest would try to run these and choke on the import.
    testMatch: "**/*.spec.ts",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: isProd ? 1 : process.env.CI ? 2 : 0,
    workers: isProd ? 2 : process.env.CI ? 2 : undefined,
    reporter: [
        ...(process.env.CI
            ? [["github"], ["html", { open: "never" }]]
            : [["list"], ["html", { open: "never" }]]),
        // Release runs (against a deployed site) also write the release
        // report; the CMS-free sweep keeps exactly the reporters above.
        ...(ownsServer ? [] : [["./e2e/release/support/reporter.ts"]]),
    ] as ReporterDescription[],
    use: {
        baseURL,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    projects: [
        {
            name: "chromium",
            // Release checks need a deployed site with real data; they belong
            // to the `release` project below, never to the CMS-free sweep.
            testIgnore: "release/**",
            use: desktopChrome,
        },
        // Release checks: defined only against a deployed site. E2E_TARGET
        // (qa|prod) picks e2e/release/targets.ts. See docs/e2e-testing.md.
        ...(ownsServer
            ? []
            : [
                  {
                      name: "release-setup",
                      testMatch: "release/*.setup.ts",
                      use: desktopChrome,
                  },
                  {
                      name: "release",
                      testMatch: "release/**/*.spec.ts",
                      dependencies: ["release-setup"],
                      use: desktopChrome,
                  },
              ]),
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

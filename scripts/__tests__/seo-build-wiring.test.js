const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

/**
 * These tests guard the seam between the pure builders in seo-artifacts.js and
 * the release pipeline that drives them. The unit tests around
 * `resolveEnvironment` were green throughout the incident that prompted this
 * file -- the defect was never in the rules, it was that CI never passed the
 * environment in. So this file deliberately asserts against the real workflow
 * YAML and the real script, not against a fixture.
 */

const CLIENT_ROOT = path.resolve(__dirname, "../..");
const WORKFLOWS_DIR = path.join(CLIENT_ROOT, ".github", "workflows");

/** The environment each build script stands for. */
const BUILD_SCRIPT_ENVIRONMENTS = {
    "build:prod": "production",
    "build:qa": "qa",
};

/** Splits a workflow into its individual `- ...` step blocks. */
const stepsIn = (yaml) => yaml.split(/^[ \t]*- /m).slice(1);

const deployWorkflows = fs
    .readdirSync(WORKFLOWS_DIR)
    .filter((file) => /\.ya?ml$/.test(file))
    .map((file) => ({
        file,
        yaml: fs.readFileSync(path.join(WORKFLOWS_DIR, file), "utf8"),
    }))
    .filter(({ yaml }) => yaml.includes("cp:all"));

describe("CD workflows", () => {
    it("finds the workflows that generate the crawler artifacts", () => {
        // Guards the guard: if cp:all is renamed, the assertions below would
        // silently iterate an empty list and pass without checking anything.
        expect(deployWorkflows.length).toBeGreaterThan(0);
    });

    it.each(deployWorkflows.map(({ file }) => file))(
        "%s tells the cp:all step which environment it is building for",
        (file) => {
            const { yaml } = deployWorkflows.find((w) => w.file === file);
            const copyStep = stepsIn(yaml).find((step) =>
                step.includes("npm run cp:all")
            );

            expect(copyStep).toBeDefined();
            expect(copyStep).toMatch(/NODE_ENV/);
        }
    );

    it.each(deployWorkflows.map(({ file }) => file))(
        "%s copies for the same environment it builds for",
        (file) => {
            const { yaml } = deployWorkflows.find((w) => w.file === file);
            const [, buildScript] =
                yaml.match(/npm run (build:prod|build:qa)/) ?? [];
            const copyStep = stepsIn(yaml).find((step) =>
                step.includes("npm run cp:all")
            );

            expect(buildScript).toBeDefined();
            expect(copyStep).toContain(
                `NODE_ENV: ${BUILD_SCRIPT_ENVIRONMENTS[buildScript]}`
            );
        }
    );
});

describe("package scripts", () => {
    const { scripts } = require("../../package.json");

    /**
     * Same defect as the workflows, one level down: these chain `cp:all` and the
     * dev server in one line, and cross-env only reaches the process it prefixes.
     * With the env set after cp:all, the artifacts describe localhost while the
     * server serves a qa/prod build.
     */
    it.each([
        ["start:qa", "qa"],
        ["start:prod", "production"],
    ])(
        "%s generates its artifacts for %s, not for development",
        (name, env) => {
            const script = scripts[name];
            const copyAt = script.indexOf("cp:all");
            const envAt = script.indexOf(`NODE_ENV=${env}`);

            expect(copyAt).toBeGreaterThan(-1);
            expect(envAt).toBeGreaterThan(-1);
            expect(envAt).toBeLessThan(copyAt);
        }
    );
});

describe("copy-seo.js", () => {
    /**
     * `resolveEnvironment` runs before the script touches the filesystem, so an
     * unnamed environment aborts without leaving half-written artifacts in
     * public/. That ordering is what makes this test safe to run.
     */
    it("fails the build in CI when nothing named the environment", () => {
        let error = null;
        try {
            execFileSync("node", ["scripts/copy-seo.js"], {
                cwd: CLIENT_ROOT,
                env: { ...process.env, CI: "true", NODE_ENV: "" },
                encoding: "utf8",
                stdio: "pipe",
            });
        } catch (caught) {
            error = caught;
        }

        expect(error).not.toBeNull();
        expect(error.status).not.toBe(0);
        expect(error.stderr).toMatch(/NODE_ENV/);
    });
});

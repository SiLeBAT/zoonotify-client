#!/usr/bin/env node
/**
 * Release sign-off issue for release-checks.yml: derives X.Y.Z from the
 * rc-X.Y.Z branch or vX.Y.Z tag, finds the open issue "Release sign-off X.Y.Z"
 * (or creates it from e2e/release/release-checks.md) and comments the run's
 * report plus a link to the run. Any other ref does nothing.
 *
 * Env: RELEASE_REF, GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_SERVER_URL,
 * GITHUB_API_URL, GITHUB_RUN_ID.
 */
const fs = require("fs");
const path = require("path");

const CHECKS_LIST = path.resolve(__dirname, "../e2e/release/release-checks.md");
const REPORT = path.resolve(__dirname, "../release-report.md");
const MAX_COMMENT = 60000;

function versionFromRef(ref) {
    const match =
        /^(?:refs\/heads\/rc-|refs\/tags\/v|rc-|v)(\d+\.\d+\.\d+)$/.exec(
            ref || ""
        );
    return match ? match[1] : null;
}

const signoffTitle = (version) => `Release sign-off ${version}`;

/** Rows of the checks list whose Test column is `manual`. */
function manualChecks(markdown) {
    const checks = [];
    let columns = null;
    for (const line of markdown.split(/\r?\n/)) {
        if (!line.trim().startsWith("|")) continue;
        const cells = line
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((c) => c.trim().replace(/`/g, ""));
        if (cells.every((c) => /^:?-+:?$/.test(c))) continue;
        if (cells[0] === "ID") {
            columns = {
                check: cells.indexOf("Check"),
                test: cells.indexOf("Test"),
            };
            continue;
        }
        if (columns && cells[columns.test] === "manual") {
            checks.push({ id: cells[0], check: cells[columns.check] });
        }
    }
    return checks;
}

function buildIssueBody(version, checksMarkdown) {
    const boxes = manualChecks(checksMarkdown).map(
        (c) => `- [ ] \`${c.id}\`: ${c.check}`
    );
    return [
        `Sign-off for release ${version}. Every run of the release checks for this release is commented below.`,
        "",
        "## Manual checks",
        "",
        ...boxes,
        "",
        "## Findings",
        "",
        "| Check ID | Outcome | Colour | Note |",
        "| --- | --- | --- | --- |",
        "",
        "## Decision",
        "",
        "- [ ] Released OK for cut",
        "",
    ].join("\n");
}

async function findOrCreateIssue(client, version, body) {
    const title = signoffTitle(version);
    const existing = await client.findOpenIssueByTitle(title);
    if (existing) return { number: existing.number, created: false };
    const issue = await client.createIssue(title, body);
    return { number: issue.number, created: true };
}

async function postRunComment(client, number, report, runLink) {
    let text = report || "No report was produced by this run.";
    if (text.length > MAX_COMMENT) {
        text =
            text.slice(0, MAX_COMMENT) +
            "\n\n... report truncated, see the run.";
    }
    await client.createComment(
        number,
        `${text}\n\nRun: ${runLink || "unknown"}\n`
    );
}

async function run({
    env,
    client,
    readFile = (f) => fs.readFileSync(f, "utf8"),
}) {
    const version = versionFromRef(env.RELEASE_REF);
    if (!version) {
        console.log(
            `Ref "${env.RELEASE_REF}" is not rc-X.Y.Z or vX.Y.Z: no comment.`
        );
        return { skipped: true };
    }
    const body = buildIssueBody(version, readFile(CHECKS_LIST));
    const { number, created } = await findOrCreateIssue(client, version, body);
    let report = null;
    try {
        report = readFile(REPORT);
    } catch {
        // commented without a report
    }
    const runLink =
        env.GITHUB_SERVER_URL && env.GITHUB_REPOSITORY && env.GITHUB_RUN_ID
            ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
            : null;
    await postRunComment(client, number, report, runLink);
    console.log(
        `${created ? "Created" : "Found"} issue #${number}; commented.`
    );
    return { number, created };
}

/** GitHub REST client over fetch. */
function restClient(env, fetchImpl = fetch) {
    const api = env.GITHUB_API_URL || "https://api.github.com";
    const repo = env.GITHUB_REPOSITORY;
    const call = async (method, url, payload) => {
        const response = await fetchImpl(`${api}/repos/${repo}${url}`, {
            method,
            headers: {
                Authorization: `Bearer ${env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github+json",
                "Content-Type": "application/json",
            },
            body: payload ? JSON.stringify(payload) : undefined,
        });
        if (!response.ok) {
            throw new Error(
                `${method} ${url}: ${response.status} ${await response.text()}`
            );
        }
        return response.json();
    };
    return {
        async findOpenIssueByTitle(title) {
            for (let page = 1; page <= 20; page++) {
                const items = await call(
                    "GET",
                    `/issues?state=open&per_page=100&page=${page}`
                );
                const hit = items.find(
                    (i) => !i.pull_request && i.title === title
                );
                if (hit) return hit;
                if (items.length < 100) return null;
            }
            return null;
        },
        createIssue: (title, body) => call("POST", "/issues", { title, body }),
        createComment: (number, body) =>
            call("POST", `/issues/${number}/comments`, { body }),
    };
}

module.exports = {
    versionFromRef,
    signoffTitle,
    manualChecks,
    buildIssueBody,
    findOrCreateIssue,
    postRunComment,
    run,
    restClient,
};

if (require.main === module) {
    run({ env: process.env, client: restClient(process.env) }).catch(
        (error) => {
            console.error(error);
            process.exit(1);
        }
    );
}

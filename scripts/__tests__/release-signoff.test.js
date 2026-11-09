const fs = require("fs");
const path = require("path");
const {
    versionFromRef,
    versionFromRefs,
    manualChecks,
    buildIssueBody,
    signoffTitle,
    findOrCreateIssue,
    postRunComment,
    run,
} = require("../release-signoff");

const LIST = fs.readFileSync(
    path.resolve(__dirname, "../../e2e/release/release-checks.md"),
    "utf8"
);

const fakeClient = (existing = []) => {
    const issues = [...existing];
    const comments = [];
    return {
        issues,
        comments,
        findIssueByTitle: async (title) =>
            issues.find((i) => i.title === title && i.state === "open") ||
            issues.find((i) => i.title === title) ||
            null,
        createIssue: async (title, body) => {
            const issue = {
                number: 100 + issues.length,
                title,
                body,
                state: "open",
            };
            issues.push(issue);
            return issue;
        },
        createComment: async (number, body) => {
            comments.push({ number, body });
        },
    };
};

describe("versionFromRef", () => {
    it.each([
        ["rc-1.2.3", "1.2.3"],
        ["refs/heads/rc-0.0.0", "0.0.0"],
        ["v10.20.30", "10.20.30"],
        ["refs/tags/v1.2.3", "1.2.3"],
    ])("reads %s", (ref, version) => {
        expect(versionFromRef(ref)).toBe(version);
    });

    it.each([
        "develop",
        "refs/heads/develop",
        "main",
        "rc-1.2",
        "rc-1.2.3-beta",
        "v1.2.3.4",
        "feature/rc-1.2.3",
        "1234567890abcdef1234567890abcdef12345678",
        "",
        undefined,
    ])("returns null for %s", (ref) => {
        expect(versionFromRef(ref)).toBeNull();
    });
});

describe("versionFromRefs", () => {
    const sha = "1234567890abcdef1234567890abcdef12345678";

    it("takes the caller branch when inputs.ref is a SHA", () => {
        expect(versionFromRefs([sha, "refs/heads/rc-1.2.3"])).toBe("1.2.3");
    });

    it("takes the tag when the caller ref is develop", () => {
        expect(versionFromRefs(["v2.0.1", "refs/heads/develop"])).toBe("2.0.1");
    });

    it("gives null when neither names a release", () => {
        expect(versionFromRefs([sha, "refs/heads/develop"])).toBeNull();
        expect(versionFromRefs([])).toBeNull();
    });
});

describe("buildIssueBody", () => {
    const manualIds = [
        ...LIST.matchAll(/^\|\s*`([^`]+)`.*\|\s*manual\s*\|\s*$/gm),
    ].map((m) => m[1]);

    it("lists exactly the manual rows of release-checks.md as checkboxes", () => {
        expect(manualChecks(LIST).map((c) => c.id)).toEqual(manualIds);
        expect(manualIds.length).toBeGreaterThan(0);
        const body = buildIssueBody("1.2.3", LIST);
        const boxes = body.split("\n").filter((l) => /^- \[ \] `/.test(l));
        expect(boxes).toHaveLength(manualIds.length);
        manualIds.forEach((id, i) =>
            expect(boxes[i]).toContain("`" + id + "`")
        );
    });

    it("has an empty findings table and the cut checkbox", () => {
        const body = buildIssueBody("1.2.3", LIST);
        expect(body).toContain("| Check ID | Outcome | Colour | Note |");
        expect(body).toContain("- [ ] Released OK for cut");
        expect(body).toContain("1.2.3");
        expect(body.split("\n").filter((l) => l.startsWith("|"))).toHaveLength(
            2
        );
    });

    it("does not list automated or pending rows as checkboxes", () => {
        expect(buildIssueBody("1.2.3", LIST)).not.toContain("`footer.links`");
    });

    it("parses a synthetic list", () => {
        const md = [
            "| ID | Check | Test |",
            "| --- | --- | --- |",
            "| `a.b` | Thing A | manual |",
            "| `c.d` | Thing C | e2e/x.spec.ts |",
            "| `e.f` | Thing E | `manual` |",
        ].join("\n");
        expect(manualChecks(md)).toEqual([
            { id: "a.b", check: "Thing A" },
            { id: "e.f", check: "Thing E" },
        ]);
    });
});

describe("findOrCreateIssue", () => {
    it("creates the issue when none is open", async () => {
        const client = fakeClient();
        const result = await findOrCreateIssue(client, "1.2.3", "body");
        expect(result).toMatchObject({ created: true });
        expect(client.issues).toHaveLength(1);
        expect(client.issues[0].title).toBe(signoffTitle("1.2.3"));
        expect(client.issues[0].body).toBe("body");
    });

    it("reuses the open issue", async () => {
        const client = fakeClient([
            { number: 5, title: "Release sign-off 1.2.3", state: "open" },
        ]);
        const result = await findOrCreateIssue(client, "1.2.3", "body");
        expect(result).toMatchObject({ created: false, number: 5 });
        expect(client.issues).toHaveLength(1);
    });

    it("reuses a closed issue without reopening it or creating a duplicate", async () => {
        const client = fakeClient([
            { number: 5, title: "Release sign-off 1.2.3", state: "closed" },
        ]);
        const result = await findOrCreateIssue(client, "1.2.3", "body");
        expect(result).toMatchObject({ created: false, number: 5 });
        expect(client.issues).toHaveLength(1);
        expect(client.issues[0].state).toBe("closed");
    });

    it("prefers an open issue over a closed one with the same title", async () => {
        const client = fakeClient([
            { number: 5, title: "Release sign-off 1.2.3", state: "closed" },
            { number: 7, title: "Release sign-off 1.2.3", state: "open" },
        ]);
        const result = await findOrCreateIssue(client, "1.2.3", "body");
        expect(result.number).toBe(7);
    });

    it("does not match a different version's issue", async () => {
        const client = fakeClient([
            { number: 5, title: "Release sign-off 1.2.30", state: "closed" },
        ]);
        const result = await findOrCreateIssue(client, "1.2.3", "body");
        expect(result.created).toBe(true);
    });
});

describe("run", () => {
    const env = (ref) => ({
        RELEASE_REFS: ref,
        GITHUB_SERVER_URL: "https://github.com",
        GITHUB_REPOSITORY: "o/r",
        GITHUB_RUN_ID: "42",
    });
    const readFile = (file) => {
        if (file.endsWith("release-checks.md")) return LIST;
        if (file.endsWith("release-report.md"))
            return "# Release report\n\nall fine\n";
        throw new Error("ENOENT " + file);
    };

    it("creates the issue then comments; a second run only comments", async () => {
        const client = fakeClient();
        await run({ env: env("rc-0.0.0"), client, readFile });
        await run({ env: env("refs/heads/rc-0.0.0"), client, readFile });
        expect(client.issues).toHaveLength(1);
        expect(client.comments).toHaveLength(2);
        expect(client.comments[0].body).toContain("all fine");
        expect(client.comments[0].body).toContain(
            "https://github.com/o/r/actions/runs/42"
        );
    });

    it("comments nowhere on another ref", async () => {
        const client = fakeClient();
        const result = await run({ env: env("develop"), client, readFile });
        expect(result).toEqual({ skipped: true });
        expect(client.issues).toHaveLength(0);
        expect(client.comments).toHaveLength(0);
    });

    it("still comments with the run link when the report is missing", async () => {
        const client = fakeClient();
        await run({
            env: env("v1.0.0"),
            client,
            readFile: (f) => {
                if (f.endsWith("release-checks.md")) return LIST;
                throw new Error("ENOENT");
            },
        });
        expect(client.comments[0].body).toMatch(/no report/i);
        expect(client.comments[0].body).toContain("/actions/runs/42");
    });
});

describe("postRunComment", () => {
    it("truncates a report beyond the comment size limit", async () => {
        const client = fakeClient();
        await postRunComment(client, 1, "x".repeat(100000), "https://r");
        expect(client.comments[0].body.length).toBeLessThan(65536);
    });
});

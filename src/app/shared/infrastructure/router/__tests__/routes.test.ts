import fs from "fs";
import path from "path";
import {
    isApiReferenceLinked,
    isLinkFinderVisible,
    isMicrobialTypingVisible,
} from "../routes";

describe("isApiReferenceLinked", () => {
    it.each([undefined, "", "true", "yes"])(
        "links the reference for %p",
        (value) => {
            expect(isApiReferenceLinked(value)).toBe(true);
        }
    );

    it("hides the link only when the build sets it to false", () => {
        expect(isApiReferenceLinked("false")).toBe(false);
        expect(isApiReferenceLinked(" false ")).toBe(false);
    });
});

/**
 * Until prod serves every collection the reference promises (issue 037), a
 * production build must not link it. The env files decide that per build.
 */
describe("API reference link per environment", () => {
    const flagIn = (file: string): string | undefined => {
        const source = fs.readFileSync(
            path.resolve(__dirname, "../../../../../..", file),
            "utf8"
        );
        return source.match(
            /^REACT_APP_API_REFERENCE_LINKED\s*=\s*(.*)$/m
        )?.[1];
    };

    it("is hidden in production builds", () => {
        expect(isApiReferenceLinked(flagIn(".env.production"))).toBe(false);
    });

    it.each([".env", ".env.qa"])("stays linked in %s", (file) => {
        expect(isApiReferenceLinked(flagIn(file))).toBe(true);
    });
});

describe("isMicrobialTypingVisible", () => {
    it.each([undefined, "", "true"])("shows the page for %p", (value) => {
        expect(isMicrobialTypingVisible(value)).toBe(true);
    });

    it("hides the page only when the build sets it to false", () => {
        expect(isMicrobialTypingVisible("false")).toBe(false);
        expect(isMicrobialTypingVisible(" false ")).toBe(false);
    });
});

/**
 * The Microbial typing page (#1898) is not ready for the public: a production
 * build must not reach it, while local and QA builds keep it for review.
 */
describe("Microbial typing page per environment", () => {
    const flagIn = (file: string): string | undefined =>
        fs
            .readFileSync(
                path.resolve(__dirname, "../../../../../..", file),
                "utf8"
            )
            .match(/^REACT_APP_MICROBIAL_TYPING_VISIBLE\s*=\s*(.*)$/m)?.[1];

    it("is hidden in production builds", () => {
        expect(isMicrobialTypingVisible(flagIn(".env.production"))).toBe(false);
    });

    it.each([".env", ".env.qa"])("is visible in %s", (file) => {
        expect(isMicrobialTypingVisible(flagIn(file))).toBe(true);
    });
});

describe("isLinkFinderVisible", () => {
    it.each([undefined, "", "true"])("shows the search for %p", (value) => {
        expect(isLinkFinderVisible(value)).toBe(true);
    });

    it("hides the search only when the build sets it to false", () => {
        expect(isLinkFinderVisible("false")).toBe(false);
        expect(isLinkFinderVisible(" false ")).toBe(false);
    });
});

/**
 * The Link Finder (spec 102) is for review on local and QA builds only: a
 * production build must not show it.
 */
describe("Link Finder per environment", () => {
    const flagIn = (file: string): string | undefined =>
        fs
            .readFileSync(
                path.resolve(__dirname, "../../../../../..", file),
                "utf8"
            )
            .match(/^REACT_APP_LINK_FINDER_VISIBLE\s*=\s*(.*)$/m)?.[1];

    it("is hidden in production builds", () => {
        expect(isLinkFinderVisible(flagIn(".env.production"))).toBe(false);
    });

    it.each([".env", ".env.qa"])("is visible in %s", (file) => {
        expect(isLinkFinderVisible(flagIn(file))).toBe(true);
    });
});

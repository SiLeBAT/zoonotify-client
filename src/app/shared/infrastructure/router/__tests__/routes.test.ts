import fs from "fs";
import path from "path";
import { isApiReferenceLinked } from "../routes";

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

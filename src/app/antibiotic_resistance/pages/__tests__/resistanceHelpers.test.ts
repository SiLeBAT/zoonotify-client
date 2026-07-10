import { buildMicroorganismFilter } from "../resistanceHelpers";

describe("buildMicroorganismFilter", () => {
    it("matches ESBL/AmpC E. coli by substring so it resolves in both locales", () => {
        // The DB name is translated ("ESBL/AmpC-producing E. coli" vs
        // "ESBL/AmpC-bildende E. coli"), so only the "ESBL" stem is stable.
        expect(buildMicroorganismFilter("ESBL/AmpC E. coli")).toBe(
            "&filters[microorganism][name][$containsi]=ESBL"
        );
    });
});

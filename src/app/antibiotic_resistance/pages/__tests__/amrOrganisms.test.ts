import { AMR_ORGANISMS, AMR_ORGANISMS_WITHOUT_DATA } from "../amrOrganisms";

describe("AMR page organisms", () => {
    it("lists ESBL/AmpC E. coli as the only organism without data", () => {
        expect([...AMR_ORGANISMS_WITHOUT_DATA]).toEqual(["ESBL/AmpC E. coli"]);
    });

    it("shows every organism without data in the organism list", () => {
        AMR_ORGANISMS_WITHOUT_DATA.forEach((org) =>
            expect(AMR_ORGANISMS).toContain(org)
        );
    });
});

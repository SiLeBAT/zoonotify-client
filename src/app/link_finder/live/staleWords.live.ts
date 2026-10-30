// The stale-word check against a live CMS. Needs the network, so it is not a `.test.ts`:
// the default jest run and the pre-commit hook never pick it up. Run it with
// `npm run check:stale-words`; CI runs it in the `stale-words` job (.github/workflows/stale-words.yml).
import { cmsOfficialNames } from "../cms";
import { EverydayWord } from "../model";
import { checkEverydayWords } from "../wordList";
import everydayWords from "../wordList/everyday-words.json";

/** Production CMS public API by default; set LINK_FINDER_CMS_API to check another (e.g. QA). */
const API_BASE =
    process.env.LINK_FINDER_CMS_API || "https://zoonotify.bfr.berlin/cms/api";

describe(`everyday words against ${API_BASE}`, () => {
    it("point only at English official names and substance codes the CMS still has", async () => {
        const names = await cmsOfficialNames(API_BASE)();

        // Each entry names the row, its words and the missing target.
        expect(
            checkEverydayWords(
                names,
                everydayWords as unknown as EverydayWord[]
            )
        ).toEqual([]);
    });
});

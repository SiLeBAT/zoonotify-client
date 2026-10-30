// Jest config for checks that need the network (`npm run check:stale-words`). Kept apart
// from jest.config.js so the default run and the pre-commit hook stay offline.
const base = require("./jest.config");

module.exports = {
    ...base,
    testRegex: ".live.ts$",
    // Node's own fetch; jsdom has none.
    testEnvironment: "node",
    setupFilesAfterEnv: [],
    testTimeout: 120000,
};

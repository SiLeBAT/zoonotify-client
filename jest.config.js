module.exports = {
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    // Ignore the .claude/ directory (e.g. git worktrees created under
    // .claude/worktrees/), otherwise jest discovers a second copy of every
    // test there and the duplicate package.json trips the haste-map.
    testPathIgnorePatterns: ["/node_modules/", "/\\.claude/"],
    modulePathIgnorePatterns: ["/\\.claude/"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/empty-module.js",
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      "^canvas$": "<rootDir>/empty-module.js",
    },
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/app/App.tsx"],
    testEnvironment: "jest-environment-jsdom",
  };

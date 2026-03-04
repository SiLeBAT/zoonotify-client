module.exports = {
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
    transform: {
      "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
    },
    testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    moduleNameMapper: {
      "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/empty-module.js",
      "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    },
    collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/app/App.tsx"],
    testEnvironment: "jest-environment-jsdom",
  };

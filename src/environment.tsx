import PACKAGE from "../package.json";

const { lastChange } = PACKAGE.znConfig;

export const environment = {
    appName: "ZooNotify",
    version: PACKAGE.version,
    lastChange,
};

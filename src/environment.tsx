import { version, znConfig } from "../package.json";

const { lastChange } = znConfig;

export const environment = {
    appName: "ZooNotify",
    version,
    lastChange,
};

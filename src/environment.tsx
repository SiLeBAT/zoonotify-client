declare const webappVersion: string;
declare const commitHash: string;
declare const lastChange: string;
export const environment = {
    appName: "ZooNotify",
    version: webappVersion,
    // Short git hash of the deployed commit; only set on QA builds.
    commitHash: commitHash,
    lastChange: lastChange,
};

const path = require("path");
const backendURL = "http://localhost:3000";
const contentBase = path.resolve(__dirname, "public");
const Dotenv = require("dotenv-webpack");
const webpack = require("webpack");
const { execSync } = require("child_process");

// Import package.json to access the version
const packageJson = require("./package.json"); // Make sure the path to package.json is correct

/**
 * Short hash of the commit being built. QA passes it in explicitly
 * (--env=commitHash=...); local dev reads it from the working copy. Production
 * deliberately gets nothing so released builds report the package version.
 * Returns "" when git is unavailable or this is not a checkout.
 */
function resolveCommitHash(env) {
    if (env.commitHash) {
        return String(env.commitHash);
    }
    if (process.env.NODE_ENV === "production") {
        return "";
    }
    try {
        return execSync("git rev-parse --short HEAD", {
            cwd: __dirname,
            stdio: ["ignore", "pipe", "ignore"],
        })
            .toString()
            .trim();
    } catch {
        return "";
    }
}

module.exports = (env, argv) => {
    return {
        mode: "development",
        entry: "./src/app/App.tsx",
        output: {
            filename: "[name].bundle.js",
            path: contentBase,
        },
        devtool: "source-map",
        devServer: {
            static: contentBase,
            historyApiFallback: {
                index: "index.html",
            },
            proxy: [
                {
                    context: ["/v1"],
                    target: backendURL,
                },
                {
                    context: ["/api-docs"],
                    target: backendURL,
                },
            ],
        },
        resolve: {
            extensions: [".js", ".json", ".ts", ".tsx"],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: "ts-loader",
                    },
                    exclude: [/node_modules/],
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: "style-loader",
                        },
                        {
                            loader: "css-loader",
                        },
                    ],
                },
            ],
        },
        plugins: [
            new Dotenv({
                path: `./.env${
                    process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ""
                }`,
            }),
            new webpack.DefinePlugin({
                webappVersion: JSON.stringify(packageJson.version),
                commitHash: JSON.stringify(resolveCommitHash(env)),
                lastChange: env.lastChange
                    ? JSON.stringify(env.lastChange)
                    : JSON.stringify(new Date().toISOString()),
            }),
        ],
    };
};

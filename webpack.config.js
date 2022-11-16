const path = require("path");
const backendURL = "http://localhost:3000";
const contentBase = path.resolve(__dirname, "public");

module.exports = {
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
        proxy: {
            "/v1": {
                target: backendURL,
            },
            "/api-docs": {
                target: backendURL,
            },
        },
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
};

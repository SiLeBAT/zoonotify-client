const path = require("path");
const backendURL = "http://localhost:3000";
const contentBase = path.resolve(__dirname, "public");
const Dotenv = require('dotenv-webpack');
const webpack = require('webpack');

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
        plugins: [
            new Dotenv({
                path: `./.env${process.env.NODE_ENV ? `.${process.env.NODE_ENV}` : ''}`
            }),
            new webpack.DefinePlugin({
                webappVersion: env.version ? JSON.stringify(env.version) : JSON.stringify('2.0.0'),
                lastChange: env.lastChange ? JSON.stringify(env.lastChange): JSON.stringify(new Date().toISOString()),
            })
        ]
    };
};

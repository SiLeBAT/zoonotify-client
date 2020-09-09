const path = require("path");
module.exports = {
    mode: "development",
    entry: "./src/app/App.tsx",
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "public"),
    },
    devtool: "source-map",
    devServer: {
        contentBase: "./public",
        historyApiFallback: {
          index: 'index.html'
        },
        proxy: {
            "/v1": {
                target: "http://localhost:3000",
            },
            "/api-docs": {
                target: "http://localhost:3000",
            }
        },
    },
    resolve: {
        extensions: [".js", ".json", ".ts", ".tsx"],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                loader: "awesome-typescript-loader",
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

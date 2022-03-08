const webpack = require("webpack");
const path = require('path');

module.exports = {
    entry: {
        popup: path.join(__dirname, '../src/popup.tsx'),
        options: path.join(__dirname, '../src/options.tsx'),
        background: path.join(__dirname, '../src/background.ts'),
        content_script: path.join(__dirname, '../src/content_script.tsx')
    },
    output: {
        path: path.join(__dirname, '../dist'),
        filename: '[name].js'
    },
    optimization: {
        splitChunks: {
            name: 'bundle',
            chunks: "initial",
            cacheGroups: {
                default: {
                    test: /popup.tsx|options.tsx|content_script.tsx/,
                }
            }
        }
    },
    module: {
        rules: [{
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: []
};
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './frontend/index.ts',
    mode: 'development',
    devServer: {
        contentBase: path.join(__dirname, 'dist/frontend'),
        compress: true,
        port: 9000,
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        }, {
            test: /\.s[ac]ss$/i,
            use: [
                // Creates `style` nodes from JS strings
                "style-loader",
                // Translates CSS into CommonJS
                "css-loader",
                // Compiles Sass to CSS
                "sass-loader",
            ],
        }, ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'inline-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Topscorio',
        }),
    ],
    output: {
        filename: 'app.js',
        path: path.resolve(__dirname, 'dist', 'frontend'),
    },
};
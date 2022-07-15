const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    module: {
        rules: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader' },
            { test: /\.scss$/, use: [
                'style-loader',
                { loader: 'css-loader', options: {
                    //esModule: true,
                    modules: {
                        exportGlobals: true,
                        exportLocalsConvention: 'dashes',
                        localIdentName: '[name]_[local]__[hash:base64:8]',
                        //namedExport: true,
                    },
                    //localsConvention: 'dashes',
                } },
                'sass-loader',
            ] },
            { test: /\.txt$/i, use: 'raw-loader' },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, './template.html'),
            inject: 'body',
          }),
    ],
};

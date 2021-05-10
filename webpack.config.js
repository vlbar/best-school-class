const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');

const path = require('path');
const isDev = process.env.NODE_ENV !== 'production';

const filename = ext => isDev ? `[name].${ext}` : `[name].[fullhash].${ext}`;

module.exports = {
    mode: 'development',
    context: path.resolve(__dirname, 'src'),
    entry: ['@babel/polyfill', './index.jsx'],
    output: { 
        filename: filename('js'),
        path: path.resolve(__dirname, 'build')
    },
    devServer: {
        port: 4200
    },
    resolve: {
        extensions: ['.js', '.json', '.jsx'],
    },
    optimization: {
        minimize: !isDev,
        minimizer: [
            new TerserWebpackPlugin(),
            new OptimizeCssPlugin()
        ],
    },
    plugins: [
        new HTMLWebpackPlugin({
                template: './index.html'
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ],
    module: {
        rules: [
            {
                test: /\.(css|less)$/,
                use: [MiniCssExtractPlugin.loader,'css-loader', 'less-loader']
            },
            {
                test: /\.(png|jpg|jpeg|svg)$/,
                use: ['file-loader']
            },
            {
                test: /\.(ttf|woff|eot)$/,
                use: ['file-loader']
            },
            {
                test: /\.m?jsx$/,
                exclude: /node_modules/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-react', '@babel/preset-env']
                  }
                }
            }
        ]
    }
} 
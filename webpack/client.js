/* eslint-disable global-require, import/no-dynamic-require */

const path = require('path');
const CssExtractPlugin = require('extract-css-chunks-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const StatsWriterPlugin = require('webpack-stats-plugin').StatsWriterPlugin;
const PATHS = require('../paths');
const { createWebpackConfig } = require('./common');

const __BROWSER__ = true;
const __DEV__ = process.env.NODE_ENV === 'development';

const { buildConfig = {} } = require(path.join(
    PATHS.base,
    '/config/application'
));

module.exports = createWebpackConfig(
    {
        __DEV__,
        __BROWSER__,
        postcss_plugins: buildConfig.postcss_plugins
    },
    {
        optimization: {
            // code-splitting config
            // https://webpack.js.org/plugins/split-chunks-plugin/#optimization-splitchunks
            splitChunks: {
                chunks: 'all',
                minSize: 30000,
                minChunks: 1,
                automaticNameDelimiter: '~',
                name: true,
                cacheGroups: {
                    vendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true,
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
            },

            minimizer: [
                new TerserPlugin({
                    sourceMap: true,
                    parallel: true,
                }),
            ],
        },

        mode: __DEV__ ? 'development' : 'production',

        devtool: 'source-map',

        entry: path.join(PATHS.src, 'index'),

        output: {
            path: path.join(PATHS.dist, 'client'),
            filename: 'client-[name].js?ver=[chunkhash]',
            chunkFilename: 'chunk-[name].js?ver=[chunkhash]',
            publicPath: '/dist/',
        },

        plugins: [
            // Extract stylesheets
            new CssExtractPlugin({
                filename: 'client-[name].css?ver=[chunkhash]',
                chunkFilename: 'chunk-[id].css?ver=[chunkhash]',
            }),

            // generate stats file for SSR chunk indentification
            new StatsWriterPlugin({
                fields: ['assetsByChunkName', 'namedChunkGroups'],
                filename: 'client-stats.json',
            }),
        ],
    }
);

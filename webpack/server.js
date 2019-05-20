/* eslint-disable global-require, import/no-dynamic-require */

const path = require('path');
const webpack = require('webpack');

const CssExtractPlugin = require('extract-css-chunks-webpack-plugin');
const PATHS = require('../paths');
const { createWebpackConfig } = require('./common');

const __BROWSER__ = false;
const __DEV__ = process.env.NODE_ENV === 'development';

module.exports = (options = {}) => createWebpackConfig(
    {
        __DEV__,
        __BROWSER__,
        ...options,
    },
    {
        mode: __DEV__ ? 'development' : 'production',
        devtool: 'source-map',

        optimization: {
            // compression is not needed for server bundle
            // it'll only increase build time
            minimize: false,
        },

        // tell webpack to not bundle these
        externals: ['express', 'ejs', 'node-fetch', 'purifycss', 'uglify-js'].reduce((externals, mod) => {
            // eslint-disable-next-line
            externals[mod] = `commonjs ${mod}`;
            return externals;
        }, {}),

        // To output node bundle
        target: 'node',

        entry: {
            server: path.join(PATHS.base, 'server/index'),
        },

        output: {
            path: path.join(PATHS.dist, 'server'),
            filename: '[name].js',
            chunkFilename: 'chunk-[name]-[chunkhash].js',
            publicPath: '/dist/',
        },

        plugins: [
            // extract stylesheets
            new CssExtractPlugin({
                filename: 'server-[name].css',
                chunkFilename: 'server-[id].css',
            }),

            // do not emit chunks on server
            // we want a single bundle that we can run to render all routes synchronously
            new webpack.optimize.LimitChunkCountPlugin({
                maxChunks: 1,
            }),
        ],
    }
);

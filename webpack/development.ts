/* eslint-disable global-require, import/no-dynamic-require */

const path = require('path');
const helmet = require('helmet');
const ejs = require('ejs');
const fs = require('fs');
const { resolve } = require('path');
const express = require('express');
const uuidv4 = require('uuid/v4');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const webpack = require('webpack');
const PATHS = require('../paths');
const { createWebpackConfig } = require('./common');
const { parseConfigValue } = require('../config-helper');

const CSP = require(path.join(PATHS.base, '/server/CSP'));
const { DISABLE_CSP, SERVER_PORT, buildConfig = {} } = require(path.join(
    PATHS.base,
    '/config/application'
));
const public_config = require(path.join(PATHS.base, '/config/public'));

module.exports = createWebpackConfig(
    {
        __DEV__: true,
        __BROWSER__: true,
        useStyleLoader: true,
    },
    {
        mode: 'development',

        // eval doesnt play nice with react error boundries
        // also required for vscode debugger
        devtool: buildConfig.devtool || 'eval-source-map',

        entry: path.join(PATHS.src, 'index.tsx'),

        context: resolve(process.cwd(), 'src'),
        
        plugins: [
            // Enable HMR
            new webpack.HotModuleReplacementPlugin(),

            // reference third-party modules from DLL
            // makes dev bundle smaller and faster to build
            buildConfig.hardsource && new HardSourceWebpackPlugin(),
            buildConfig.hardsource &&
                new HardSourceWebpackPlugin.ExcludeModulePlugin(
                    [
                        {
                            test: /mini-css-extract-plugin[\\/]dist[\\/]loader/,
                        },
                        {
                            test: /@sentry/,
                        },
                    ].concat(buildConfig.hardsource_ignore || [])
                ),
        ],

        devServer: {
            hot: true,

            port: SERVER_PORT,

            // Accessible from local network
            host: '0.0.0.0',

            // All paths render index.html
            historyApiFallback: true,

            before(app) {
                // Use CSP here as well
                // reduce surprises in production build
                const __DEV__ = true;
                if (!DISABLE_CSP) {
                    app.use((req, res, next) => {
                        res.locals.nonce = uuidv4();
                        next();
                    });
                    app.use(helmet.contentSecurityPolicy(CSP(__DEV__)));
                    app.get('/favicon.ico', (req, res) => res.status(204));
                }
            },

            after(app) {
                const config = {};

                for (const key in public_config) {
                    if (process.env[key]) {
                        config[key] = parseConfigValue(public_config[key], process.env[key]);
                    }
                }

                // Serve files from /dist and /assets
                app.use('/dist', express.static(path.join(PATHS.dist, 'client')));
                app.use('/assets', express.static(PATHS.assets));

                app.get('*', (req, res) => {
                    const indexTemplate = fs.readFileSync(path.join(PATHS.base, 'client/index.dev.ejs'), 'utf8');

                    res.send(
                        ejs.render(indexTemplate, {
                            public_config: JSON.stringify(config),
                            nonce: res.locals.nonce,
                        })
                    );
                });
            },

            // Reduce console noise
            stats: {
                chunks: false,
                chunkModules: false,
                modules: false,
                chunkOrigins: false,
                colors: true,
                version: true,
                assets: false,
                cachedAssets: false,
                warningsFilter: warning => warning.indexOf('Critical dependency') > -1,
            },
        },
    }
);

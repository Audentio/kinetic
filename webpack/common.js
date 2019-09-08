/* eslint-disable global-require, import/no-dynamic-require */

const webpack = require('webpack');
const path = require('path');
const CssExtractPlugin = require('extract-css-chunks-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const PATHS = require('../paths');

const pkg = require(path.join(PATHS.base, 'package.json'));

const postcss_loader = (postcss_plugins = []) => ({
    loader: 'postcss-loader',
    options: {
        ident: 'postcss',
        sourceMap: process.env.NODE_ENV === 'development',
        plugins: () => [
            require('postcss-flexbugs-fixes')(),
            require('autoprefixer')(),
            require('postcss-css-variables')(),
            require('cssnano')({ preset: 'default' }),
            ...postcss_plugins,
        ],
    },
});

const css_loader = __DEV__ => ({
    loader: 'css-loader',
    options: {
        sourceMap: __DEV__,
        importLoaders: 1,
        modules: {
            context: PATHS.src,
            mode: 'local',
            localIdentName: __DEV__ ? '[path][name]__[local]--[hash:base64:5]' : '[local]--[hash:base64:8]',
        },
    },
});

const transpileModules = /@audentio/;
const loaders = {
    js: {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: modulePath => {
            if (modulePath.indexOf('node_modules') === -1) return false;
            if (transpileModules.test(modulePath)) return false;

            return true;
        },

        use: [
            {
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                },
            },
        ],
    },

    css: ({ __DEV__, __BROWSER__, useStyleLoader, postcss_plugins }) => ({
        test: /\.css$/,
        use: [
            useStyleLoader && __BROWSER__ ? 'style-loader' : CssExtractPlugin.loader,
            css_loader(__DEV__),
            postcss_loader(postcss_plugins),
        ],
    }),

    scss: ({ __DEV__, __BROWSER__, useStyleLoader, sass_resources, postcss_plugins }) => ({
        test: /\.scss$/,
        use: [
            useStyleLoader && __BROWSER__ ? 'style-loader' : CssExtractPlugin.loader,
            css_loader(__DEV__),
            postcss_loader(postcss_plugins),
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: __DEV__,
                },
            },
            {
                loader: 'sass-resources-loader',
                options: {
                    resources: sass_resources || [path.resolve(PATHS.src, 'theme.scss')],
                },
            },
        ],
    }),

    files: [
        // responsive images
        {
            test: /\.(jpe?g|png)$/i,
            loader: 'responsive-loader',
            options: {
                // we'll use jimp until build perf becomes a problem
                // adapter: require('responsive-loader/sharp'),
            },
        },

        // Images & Videos
        {
            test: /\.(jpe?g|png|gif|svg|mp4|gif)$/i,
            loader: 'file-loader',
        },

        // webfonts
        {
            test: /\.(woff|woff2|ttf|eot|webfont.svg)(\?v=[\S]+)?$/,
            loader: 'file-loader',
        },

        // raw
        {
            test: /\.(ejs)(\?v=[\S]+)?$/,
            loader: 'raw-loader',
        },

        // graphql
        {
            test: /\.(graphql|gql)$/,
            exclude: /node_modules/,
            loader: 'graphql-tag/loader',
        },
    ],
};

// merge passed config with defaults
const createWebpackConfig = (options, $config) => {
    const { module = {}, plugins = [], stats, output, ...config } = $config;
    return {
        ...config,

        stats: {
            timings: true,
            chunks: false,
            colors: options.__DEV__,
            version: true,

            entrypoints: false,
            chunkGroups: false,
            chunkOrigins: true,

            modules: false,
            assets: true,
            cachedAssets: false,
            children: false,
            warningsFilter: warning =>
                warning.indexOf('Critical dependency') > -1 || warning.indexOf('Conflicting order between') > -1,
            ...stats,
        },

        performance: {
            hints: false,
        },

        module: {
            ...module,
            rules: [loaders.js, loaders.css(options), loaders.scss(options), ...loaders.files].concat(
                module.rules || []
            ),
        },

        resolve: {
            mainFields: options.__BROWSER__ ? ['browser', 'main', 'module'] : ['main', 'module'],
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
            modules: [PATHS.node_modules, PATHS.src, PATHS.base],
        },

        output: output || {
            path: PATHS.dist,
            filename: '[name].js',
            chunkFilename: 'chunk-[chunkhash].js',
            publicPath: '/dist/',
        },

        plugins: [
            new webpack.DefinePlugin({
                __VERSION__: `'${pkg.version}'`,
                __BROWSER__: options.__BROWSER__,
                __DEV__: options.__DEV__,
            }),

            process.env.ANALYZE && new BundleAnalyzerPlugin(),
        ]
            .concat(plugins) // add defined plugins
            .filter(plugin => !!plugin), // filter out falsy items
    };
};

module.exports = {
    createWebpackConfig,
    loaders,
};

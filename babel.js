/* eslint-disable no-template-curly-in-string */

const default_presets = () => [
    [
        '@babel/preset-env',
        {
            exclude: ['transform-regenerator', 'transform-async-to-generator'],
            modules: false,
            loose: true,
        },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
];

const server_presets = () => [
    [
        '@babel/preset-env',
        {
            exclude: ['transform-regenerator', 'transform-async-to-generator'],
            targets: {
                node: 'current',
                browsers: [],
            },
            modules: false,
            loose: true,
        },
    ],
    '@babel/preset-react',
    '@babel/preset-typescript',
];

const test_presets = () => [['@babel/preset-env'], '@babel/preset-react'];

const plugins = () => [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-proposal-class-properties', { loose: false }],
    'universal-import',
    '@babel/plugin-syntax-dynamic-import',
    [
        'module:fast-async',
        {
            env: {
                log: false,
            },
            compiler: {
                promises: false,
                generators: false,
            },
            runtimePattern: null,
            useRuntimeModule: false,
        },
    ],
    [
        'transform-imports',
        {
            lodash: {
                transform: 'lodash/${member}',
                preventFullImport: true,
            },
            components: {
                transform: 'components/${member}',
                preventFullImport: true,
            },
            src_components: {
                transform: 'src/components/${member}',
                preventFullImport: true,
            },
            utils: {
                transform: 'utils/${member}',
                preventFullImport: true,
            },
            src_utils: {
                transform: 'src/utils/${member}',
                preventFullImport: true,
            },
        },
    ],
];

module.exports = {
    default_presets,
    server_presets,
    test_presets,
    plugins,
    default_config: {
        presets: default_presets(),
        plugins: plugins(),
        env: {
            test: {
                presets: test_presets(),
            },
            server: {
                presets: server_presets(),
            },
        },
    },
};

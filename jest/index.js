const config = {
    globals: {
        __DEV__: false,
        __BROWSER__: true,
    },
    testURL: 'http://localhost',
    setupFiles: ['<rootDir>/internals/jest/setup.js'],
    transform: {
        '^.+\\.(t|j)sx?$': 'babel-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(t|j)sx?$',
    moduleDirectories: ['<rootDir>/node_modules', '<rootDir>/app', '<rootDir>'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!@audentio)'],
    testPathIgnorePatterns: ['node_modules', 'cypress'],
    moduleNameMapper: {
        '^.+\\.(css|scss)$': 'identity-obj-proxy',
        '^.+\\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 'test-file-stub',
    },
};

module.exports = config;

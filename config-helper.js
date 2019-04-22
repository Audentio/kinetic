/**
 * convert `customValue` to the same type as `defaultValue`
 * */
const parseConfigValue = (defaultValue, customValue) => {
    const valueType = typeof defaultValue;

    if (valueType === 'boolean') {
        return customValue === 'true';
    } else if (valueType === 'number') {
        return Number(customValue);
    }

    return customValue;
};

function createConfig(defaultConfig) {
    const config = {};

    for (const key in defaultConfig) {
        // on browser, overrides come from window.__CONFIG__
        // process.env is used on server
        const source = typeof window !== 'undefined' ? window.__CONFIG__ || {} : process.env;

        if (source.hasOwnProperty(key)) {
            const shouldParse = typeof window === 'undefined';

            // convert env vars from string to expected type (if source is processs.env)
            config[key] = shouldParse ? parseConfigValue(defaultConfig[key], source[key]) : source[key];
        } else {
            config[key] = defaultConfig[key];
        }
    }

    return config;
}

exports.config = createConfig;
exports.parseConfigValue = parseConfigValue;

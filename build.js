let cmd = '';

const bundle = process.argv.slice(2)[0];
const devOrProd = process.argv.slice(2)[1];
let CONFIG;
let BABEL_ENV;
let NODE_ENV = 'production';
let BINARY = 'webpack-dev-server';

switch (bundle) {
    case 'server':
        BABEL_ENV = 'server';
        BINARY = 'webpack';
        CONFIG = 'server.js';
        break;
    case 'client':
        BABEL_ENV = 'client';
        BINARY = 'webpack';
        CONFIG = 'client.js';
        break;
    case 'dev':
        BABEL_ENV = 'client';
        BINARY = 'webpack-dev-server';
        CONFIG = 'development.ts';
}

if (devOrProd === 'dev' || bundle === 'dev') {
    NODE_ENV = 'development';
}

cmd += `export BABEL_ENV=${BABEL_ENV};`;
cmd += `export NODE_ENV=${NODE_ENV};`;
cmd += 'node -r dotenv/config ';
cmd += `./node_modules/.bin/${BINARY} --config `;
cmd += `./node_modules/@audentio/kinetic/webpack/${CONFIG}`;

process.stdout.write(cmd);

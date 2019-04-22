const path = require('path');

const base = process.cwd();
const src = path.join(base, 'src');
const assets = path.join(src, 'assets');
const node_modules = path.join(base, 'node_modules');
const dist = path.join(base, 'dist');

module.exports = { base, src, node_modules, assets, dist };

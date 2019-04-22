const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const args = process.argv.slice(2);

function createComponent() {
    if ((args[0] !== 'c' && args[0] !== 'cs') || !args[1]) {
        console.log(chalk.yellow('invalid arguments'));
        return;
    }

    const componentName = args[1];
    const componentPath = `./src/components/${componentName}`;

    // check case
    if (!componentName.match(/^[A-Z]/)) {
        console.log(chalk.yellow('component name must be PascalCase'));
        return;
    }

    // make sure component doesn't already exist
    if (fs.existsSync(componentPath)) {
        console.log(chalk.yellow(`Component ${componentName} already exists`));
        return;
    }

    // create
    fs.mkdirSync(componentPath);
    console.log(path.join(componentPath, 'index.ts'));

    const componentIndex = `export * from './${componentName}';\n`;
    fs.writeFileSync(path.join(componentPath, 'index.ts'), componentIndex);

    const componentFile = `import React, { Component } from 'react';
${args[0] === 'cs' ? `import style from './${componentName}.scss';\n` : ''}
export class ${componentName} extends Component<any> {
    render() {
        return (
            <div>
                helloworld
            </div>
        );
    }
}\n`;

    fs.writeFileSync(path.join(componentPath, `${componentName}.tsx`), componentFile);

    if (args[0] === 'cs') {
        // component with style
        fs.writeFileSync(path.join(componentPath, `${componentName}.scss`), '');
    }

    console.log(`created src/components/${componentName}`);
}

function createUtil() {
    const utilName = args[1];
    const utilPath = `./src/utils/${utilName}.ts`;

    if (!utilName) {
        console.log('Util name missing');
        return;
    }

    // make sure it doesn't already exist
    if (fs.existsSync(utilPath)) {
        console.log(chalk.yellow(`Util ${utilName} already exists`));
        return;
    }

    // create util
    fs.writeFileSync(path.join('./src/utils', `${utilName}.ts`), `export function ${utilName}() {\n}`);

    console.log(`created src/components/${utilName}`);
}

if (args[0] === 'c' || args[0] === 'cs') {
    createComponent();
}

if (args[0] === 'u') {
    createUtil();
}

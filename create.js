const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ejs = require('ejs');

const args = process.argv.slice(2);

function generateFromTemplate(cmd, variables) {
    const template = fs.readFileSync(path.join(__dirname, `create-templates/${cmd}.ejs`), 'utf8');
    
    return ejs.render(template, variables);
}

function createComponent() {
    if (!args[1]) {
        console.log(chalk.yellow('You must pass a second argument (component name)'));
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

    // create index
    fs.mkdirSync(componentPath);
    const componentIndex = `export * from './${componentName}';\n`;
    fs.writeFileSync(path.join(componentPath, 'index.ts'), componentIndex);

    // create component file
    const componentFile = generateFromTemplate(args[0], { componentName })
    fs.writeFileSync(path.join(componentPath, `${componentName}.tsx`), componentFile);

    // create stylesheet if applicable
    if (args[0] === 'cs' || args[0] === 'ccs') {
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
    fs.writeFileSync(path.join('./src/utils', `${utilName}.ts`), `export function ${utilName}() {\n}\n`);

    console.log(`created src/utils/${utilName}`);
}

if (['c','cs', 'cc', 'ccs'].indexOf(args[0]) > -1) {
    createComponent();
}

if (args[0] === 'u') {
    createUtil();
}

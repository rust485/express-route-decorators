const fs = require('fs');
const package = require('../package.json');

delete package.scripts;
delete package.devDependencies;

fs.writeFileSync('../dist/package.json', package);

const fs = require('fs');
const package = require('../package.json');

console.log(process.cwd());
fs.writeFileSync('./dist/package.json', JSON.stringify(package, null, 2));

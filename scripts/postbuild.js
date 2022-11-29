const fs = require('fs');
const package = require('../package.json');

fs.writeFileSync('./dist/package.json', JSON.stringify(package, null, 2));

const fs = require('fs');
const path = require('path');

const testDir = 'tests';
const files = fs.readdirSync(testDir)
  .filter(function(f) { return f.endsWith('.spec.ts'); })
  .map(function(f) { return testDir + '/' + f; });

console.log(files.join('\n'));

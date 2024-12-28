const fs = require('fs');

module.exports = function () {
  const packageJson = JSON.parse(fs.readFileSync('./node_modules/@11ty/eleventy/package.json', 'utf8'));
  return { generatorStr: `${packageJson.name} v${packageJson.version}` }
}
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function updatePackageJson(opts) {
    var pkgPath = path.join(opts.outputDir, 'package.json');
    var pkgFile = fs.readFileSync(pkgPath);
    var pkgContent = JSON.parse(pkgFile);
    fs.writeFileSync(pkgPath, JSON.stringify(pkgContent, null, 2));
};

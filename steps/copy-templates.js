'use strict';

var path = require('path');
var copy = require('copy-dir');

module.exports = function copyTemplates(toDir) {
    var fromDir = path.resolve(path.join(__dirname, '..', 'templates'));
    copy.sync(fromDir, toDir);
};

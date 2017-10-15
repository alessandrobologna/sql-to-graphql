'use strict';

var fs = require('fs');
var path = require('path');
var merge = require('lodash/object/merge');
var recast = require('recast');
var mkdirp = require('mkdirp');
var buildType = require('./ast-builders/type');
var buildTypeIndex = require('./ast-builders/type-index');
var buildResolveMap = require('./ast-builders/resolve-map');
var buildSchemaModule = require('./ast-builders/schema-module');
var buildNodeDefinitions = require('./ast-builders/node-definitions');
var copyTemplates = require('./copy-templates');
var colors = require('colors');

function outputData(data, opts, callback) {
    if (opts.relay) {
        opts = merge({}, opts, { isFromSchema: true });
    }

    // Output to a directory, in other words: split stuff up
    var outputDir = path.resolve(opts.outputDir + "/src");
    var typesDir = path.join(outputDir, 'types');
    var configDir = path.join(outputDir, 'config');
    mkdirp(configDir, function(err) {
        if (err) {
            throw err;
        }

        // Write the configuration file
        // var conf = recast.prettyPrint(buildConfig(opts), opts).code;
        // fs.writeFileSync(path.join(configDir, 'config.js'), conf);

        // Write types
        mkdirp(typesDir, function(typesErr) {
            if (typesErr) {
                throw typesErr;
            }

            // Build the type AST and write the code to separate files
            var type, ast, code;
            for (type in data.types) {
                ast = buildType(data.types[type], opts);
                code = recast.prettyPrint(ast, opts).code;

                fs.writeFileSync(path.join(typesDir, data.types[type].varName + '.js'), code);
                console.log('- created type ' + type.yellow)
            }

            // Write a type index
            ast = buildTypeIndex(data, opts);
            code = recast.prettyPrint(ast, opts).code;
            fs.writeFileSync(path.join(typesDir, 'index.js'), code);

            // If this is a relay app, write the Node interface
            if (opts.relay) {
                ast = buildNodeDefinitions(opts);
                code = recast.prettyPrint(ast, opts).code;
                fs.writeFileSync(path.join(typesDir, 'Node.js'), code);
            }
        })

        // Build and write the resolve map
        var resolveMap = recast.prettyPrint(buildResolveMap(data, opts), opts).code;
        fs.writeFileSync(path.join(outputDir, 'resolve-map.js'), resolveMap);
        // Copy templates ("static" ones, should probably be named something else)
        copyTemplates(opts.outputDir);
        
        // Write the schema!
        var schemaCode = recast.prettyPrint(buildSchemaModule(data, opts), opts).code;
        fs.writeFileSync(path.join(outputDir, 'schema.js'), schemaCode);
                
        callback();
    });
}

module.exports = outputData;

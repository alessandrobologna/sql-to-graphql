'use strict';

var b = require('ast-types').builders;
var reduce = require('lodash/collection/reduce');
var buildObject = require('./object');
var buildStrict = require('./use-strict');
var buildVariable = require('./variable');
var getPrimaryKey = require('../../util/get-primary-key');

module.exports = function buildResolveMap(data, opts) {
    var map = getResolveMap(data.models, opts);

    var program = []
        .concat(buildStrict(opts))
        .concat(buildImports(opts))
        .concat(buildResolveMapExport(map, opts));

    return b.program(program);
};

function getResolveMap(models, opts) {
    var resolveMap = {};
    for (var type in models) {
        resolveMap[models[type].name] = getTypeResolver(models[type], opts);
    }

    return buildObject(resolveMap, opts);
}

function getTypeResolver(model) {
    return {
        name: model.name,
        table: model.table,
        primaryKey: getPrimaryKeyArg(model),
        aliases: model.aliasedFields,
        referenceMap: getRefFieldMapArg(model),
        listReferences: getListRefFieldMapArg(model)
    };
}

function getListRefFieldMapArg(model) {
    return reduce(model.listReferences, buildReferenceMap, {});
}

function getRefFieldMapArg(model) {
    return reduce(model.references, buildReferenceMap, {});
}

function getPrimaryKeyArg(model) {
    var primaryKey = getPrimaryKey(model);
    return primaryKey ? primaryKey.originalName : null;
}

function buildReferenceMap(refMap, reference) {
    refMap[reference.field] = reference.refField;
    return refMap;
}

function buildResolveMapExport(map, opts) {
    if (opts.es6) {
        return [b.exportDeclaration(false, buildVariable('resolveMap', map, opts.es6))];
    }

    return [
        buildVariable('resolveMap', map, opts.es6),
        b.expressionStatement(
            b.assignmentExpression(
                '=',
                b.memberExpression(
                    b.identifier('exports'),
                    b.identifier('resolveMap'),
                    false
                ),
                b.identifier('resolveMap')
            )
        )
    ];
}

function buildImports(opts) {
    if (!opts.relay) {
        return [];
    }

    if (opts.es6) {
        return [
            b.importDeclaration(
                [importSpecifier('connectionDefinitions')],
                b.literal('graphql-relay')
            )
        ];
    }

    return [
        b.variableDeclaration('var',
            [b.variableDeclarator(
                b.identifier('GraphQLRelay'),
                b.callExpression(
                    b.identifier('require'),
                    [b.literal('graphql-relay')]
                )
            )]
        ),

        b.variableDeclaration('var',
            [b.variableDeclarator(
                b.identifier('connectionDefinitions'),
                b.memberExpression(
                    b.identifier('GraphQLRelay'),
                    b.identifier('connectionDefinitions'),
                    false
                )
            )]
        )
    ];
}

function importSpecifier(name) {
    return {
        type: 'ImportSpecifier',
        id: {
            type: 'Identifier',
            name: name
        },
        name: null
    };
}
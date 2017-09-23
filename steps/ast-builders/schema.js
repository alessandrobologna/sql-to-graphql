'use strict';

var camelCase = require('lodash/string/camelCase');
var map = require('lodash/collection/map');
var b = require('ast-types').builders;
var buildVar = require('./variable');
var buildQuery = require('./query');
var buildFieldWrapperFunction = require('./field-wrapper-function');

module.exports = function(data, opts) {
    var queryFields = [];
    var types = []
    if (opts.relay) {
        queryFields.push(b.property(
            'init',
            b.identifier('node'),
            b.identifier('nodeField')
        ));
        types = map(data.types, function(type) {
            return b.identifier('types.' + type.varName)
        }).sort(function(a,b){
            return a.name > b.name
        })
    } else {
        queryFields = map(data.types, function(type) {
            return b.property(
                'init',
                b.identifier(camelCase(type.name)),
                buildQuery(type, data, opts)
            );
        }).sort(function(a,b) {
            return a.key.name > b.key.name
        });
    }
    return buildVar('schema',
        b.newExpression(
            b.identifier('GraphQLSchema'),
            [b.objectExpression([
                b.property(
                    'init',
                    b.identifier('types'),
                    b.arrayExpression(types)
                ),
                b.property(
                    'init',
                    b.identifier('query'),
                    b.newExpression(
                        b.identifier('GraphQLObjectType'),
                        [b.objectExpression([
                            b.property('init', b.identifier('name'), b.literal('RootQueryType')),
                            b.property('init', b.identifier('fields'), buildFieldWrapperFunction(
                                'RootQuery',
                                b.objectExpression(queryFields),
                                opts
                            ))
                        ])]
                    )
                )
            ])]
        )
    );
};

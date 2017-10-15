import {connectionDefinitions} from 'graphql-relay';
import {resolveMap} from '../resolve-map'
import {GraphQLObjectType, GraphQLNonNull, GraphQLInt, GraphQLString} from 'graphql';

const connections = {};

export function registerType(type) {
    if (!resolveMap[type.name]) {
        throw new Error(
            'Cannot register type "' + type.name + '" - resolve map does not exist for that type'
        );
    }

    resolveMap[type.name].type = type;
};

export function getType(type) {
    if (!resolveMap[type] || !resolveMap[type].type) {
        throw new Error('No type registered for type \'' + type + '\'');
    }

    return resolveMap[type].type;
};

export function getConnection(type) {
    if (!connections[type]) {
        connections[type] = connectionDefinitions({
            connectionFields: {
                count: {
                    type: GraphQLInt,
                    description: 'Count of the returned nodes',
                    resolve: connection => connection.count,
                },
            },

            name: type,
            nodeType: getType(type)
        }).connectionType;
    }

    return connections[type];
};
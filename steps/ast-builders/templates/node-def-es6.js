import {nodeDefinitions, fromGlobalId} from 'graphql-relay';
import getEntityResolver from '../util/entity-resolver';

const {nodeInterface, nodeField} = nodeDefinitions(
    function(globalId, context, ast) {
        let {type, id} = fromGlobalId(globalId);
        return getEntityResolver(type)(null, { id }, context, ast);
    },
    data => data.__type
);

export { nodeInterface, nodeField };

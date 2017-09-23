import { GraphQLInputObjectType, GraphQLNonNull, GraphQLString, GraphQLEnumType } from 'graphql';
import { globalIdField, connectionArgs } from 'graphql-relay';

const SQLOrderByInputType = new GraphQLInputObjectType({
  name: 'orderBy',
  fields: () => ({
    field: { type: GraphQLString },
    direction: { type: new GraphQLEnumType({
      name: 'direction',
      values: {
        ASC: { value: "ASC" },
        DESC: { value: "DESC" }
      }
    }), defaultValue: "ASC"
   },
  })
});

const SQLWhereInputType = new GraphQLInputObjectType({
  name: 'where',
  fields: () => ({
    field: { type: GraphQLString },
    value: { type: GraphQLString },
  })
});

const sqlConnectionArgs = {
  ...connectionArgs,
  orderBy: { type: SQLOrderByInputType },
  where: { type: SQLWhereInputType }
}

export {sqlConnectionArgs };
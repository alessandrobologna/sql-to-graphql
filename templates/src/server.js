import express from 'express';
import graphqlHTTP from 'express-graphql';
import MyGraphQLSchema from './schema';

const app = express();

app.use('/graphql', graphqlHTTP({
  schema: MyGraphQLSchema,
  graphiql: true
}));

app.listen(3000);

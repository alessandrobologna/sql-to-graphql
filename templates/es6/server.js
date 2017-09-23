import Hapi from 'hapi';
import GraphQL from 'hapi-graphql';
import myschema from './schema';

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
    method: 'POST',
    path: '/graphql',
    handler: require('./handlers/graphql'),
    config: {
        payload: {
            parse: false,
            allow: 'application/graphql'
        }
    }
});

server.route({
    method: 'GET',
    path: '/schema',
    handler: require('./handlers/schema-printer')
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});


server.register({
    register: GraphQL,
    options: {
      query: {
          schema: myschema,
          graphiql:true
      }, route: {
        path: '/graphiql',
        config: {}
      }
      }
  }, () =>
    server.start(() =>
      console.log('Server running at:', server.info.uri)
    )
)

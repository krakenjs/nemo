const express = require('express')
const engine = require('./engine');
var graphqlHTTP = require('express-graphql');
var {buildSchema} = require('graphql');
var debug = require('debug');
var log = debug('nemo:server:log');

var schema = buildSchema(`
    type Query {
        test(hours: Int, days: Int, title: String): [Test]
    }
    type Master {
        id: String,
        thread:[Thread]
    }
    type Thread {
        test: [String]
    }
    type Test {
        time: String,
        dataKey: String,
        duration: Int,
        error: String,
        file: String,
        fullTitle: String,
        title: String,
        grep: String,
        masterID: String,
        profile: String,
        result: String,
        stack: String,
        threadID: String
    }
`);

const rootResolver = (configuration) => {
  return {
    test: ({hours, days, title}) => {
      log(`{hours: ${hours}, days: ${days}, title: ${title}}`);
      // use influx query to get masters
      return configuration.storage.influx.query(`
          select * from test
          where title =~ /${title}/
      `).then(rows => {
        return rows;
      });
    }
  };
};

module.exports = (program) => {

  const app = express();

  engine.configure(program)
    .then(configuration => {
      app.use('/graphql', graphqlHTTP({
        schema: schema,
        rootValue: rootResolver(configuration),
        graphiql: true
      }));
      app.listen(3000, () => console.log('Nemo Server listening on port 3000!'))

    })
    .catch(err => {
      console.error(err);
    });


};

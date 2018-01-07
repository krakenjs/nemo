const express = require('express')
const prefontaine = require('./prefontaine');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  type Query {
    hello: String,
    balls: String
  }
`);

var root = { hello: () => 'Hello world!',
							balls: () => 'balls'
};

module.exports = (program) => {

	const app = express()

	app.get('/profiles', (req, res) => {
		// debugger;
		// console.log(prefontaine.config.get('profiles'))

		// res.json(prefontaine.config.get('profiles'))
    prefontaine(program)
      .then(function (pre) {
        res.json(pre.config.get('profiles'))
      });
	});
	app.post('/profiles/run/:profile', (req, res) => {
		let prog = Object.assign({}, program, {profile: req.params.profile, fromServer: true})
		prefontaine(prog)
      .then(function (pre) {
      	// console.log(pre);
        return prefontaine.start(pre);
      })
			.then(function (pre) {
			  //quick hack
        let reportUrl = `http://localhost:3000/report/${pre.config.get('profiles:base:reports').split('test/report/')[1]}/summary.json`
				res.json({launched: true,
					summary: reportUrl
				});
			})
			.catch(function (err) {
				res.json({launched: false});
			});
	});
  prefontaine(program)
    .then(function (pre) {
      app.use('/report', express.static(pre.config.get('profiles:base:reports'), {index:false}));
      app.use('/graphql', graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
      }));
      app.listen(3000, () => console.log('Nemo-Runner listening on port 3000!'))

    });


}
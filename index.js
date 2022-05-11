
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('./config/mongoose'),
    express = require('./config/express');

const { graphqlHTTP } = require('express-graphql');
var schema = require('./app/graphql/course_student_Schema');
var cors = require("cors");

var db = mongoose();
var app = express();

app.use('*', cors());
app.use('/graphql', cors(), graphqlHTTP({
  schema: schema,
  rootValue: global,
  graphiql: true,
}));

app.listen(8000);
module.exports = app; 
console.log('Server running at http://localhost:8000/');
console.log('GraphQL running at http://localhost:8000/graphql');

module.exports = app;
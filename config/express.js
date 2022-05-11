
var config = require('./config'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session');
    const cookieParser = require('cookie-parser');
    const cors = require('cors')

module.exports = function () {

    var app = express();
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json()); 
    app.use(cookieParser());
    app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
    });
    app.use(cors());
    //
    app.use(methodOverride()); 
    app.use(methodOverride('_method'));

    app.use(session({
        saveUninitialized: true,
        resave: true,
        secret: config.sessionSecret
    }));
    app.set('views', './app/views');
    app.set('view engine', 'ejs');
    /*
    app.engine('html', require('ejs').renderFile);
    require('../app/routes/index.server.routes.js')(app);
    require('../app/routes/students.server.routes.js')(app);
    require('../app/routes/courses.server.routes.js')(app);
    */

    app.use(express.static('./public'));

    return app;
};

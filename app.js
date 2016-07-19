var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var rotator = require('file-stream-rotator');
var bodyParser = require('body-parser');

var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var routes = require('./routes/index');
var users = require('./routes/users');

var config = require('./config/config.js');



// mongoDB starts
var mongoose = require('mongoose');
mongoose.connection.close();

var mongoOptions = {
  db: {
    native_parser: true
  },
  server: {
    poolSize: 5,
    socketOptions: {
      connectTimeoutMS: 30000,
      keepAlive: 1
    }
  }
};

var mongoURL = 'mongodb://' + (config.mongo.address || 'localhost') + ':' + (config.mongo.port || '27017') + '/' + (config.mongo.db || 'runcheck');

if (config.mongo.user && config.mongo.pass) {
  mongoOptions.user = config.mongo.user;
  mongoOptions.pass = config.mongo.pass;
}

if (config.mongo.auth) {
  mongoOptions.auth = config.mongo.auth;
}

mongoose.connect(mongoURL, mongoOptions);

mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection opened.');
});

mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// mongoDB ends


// ldap client starts
var adClient = require('./lib/ldap-client').client;
adClient.on('connect', function () {
  console.log('ldap client connected');
});
adClient.on('timeout', function (message) {
  console.error(message);
});
adClient.on('error', function (error) {
  console.error(error);
});
// ldap client ends



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

if (app.get('env') === 'production') {
  var logStream = rotator.getStream({
    filename: path.resolve(config.app.log_dir, 'access.log'),
    frequency: 'daily'
  });
  app.use(logger('combined', {
    stream: logStream
  }));
}

if (app.get('env') === 'development') {
  app.use(logger('dev'));
}
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(session({
  store: new RedisStore(config.redis),
  resave: false,
  saveUninitialized: false,
  secret: config.app.session_sec || 'secret',
  cookie: {
    maxAge: config.app.session_life || 28800000
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;

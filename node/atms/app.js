var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var company = require('./routes/company');
var vehicle = require('./routes/vehicle');
var taxPayment = require('./routes/taxPayment');
var fitnessCert = require('./routes/fitnessCert');
var tempPermit = require('./routes/tempPermit');
var nationalPermit = require('./routes/nationalPermit');
var common = require('./routes/common');
var mysql      = require('mysql');
var cors = require('cors');

var app = express();	
var db = mysql.createConnection({
  user     : 'root',
  password : 'admin',
  database : 'atms',
  connectTimeout : 100000,
  timezone: 'UTC',
  //dateStrings: false,
  
  acquireTimeout: 100000,
  localAddress: 'localhost'
});
var db2 = mysql.createConnection({
  user     : 'root',
  password : 'admin',
  database : 'atms',
  connectTimeout : 100000,
  //timezone: 'UTC',
  //dateStrings: false,
  
  acquireTimeout: 100000,
  localAddress: 'localhost'
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/',function(req,res,next){
   console.log('entering');
   	req.db = db;
    req.db2 = db2;
	next();
});

//app.use('/', routes);
app.use('/users', users);
app.use('/company', company);
app.use('/vehicle', vehicle);
app.use('/taxPayment', taxPayment);
app.use('/fitnessCert', fitnessCert);
app.use('/tempPermit', tempPermit);
app.use('/nationalPermit', nationalPermit);
app.use('/common', common);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

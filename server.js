var express = require('express'),
    app = express(),
    passport = require('passport'),
    expressSession = require('express-session'),
    bodyParser = require('body-parser');

var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost:27017/resource-center');
mongoose.connect('mongodb://localhost:27017/branch');

//configure passport strategies
require('./server/js/passport/config.js')(passport);

//app.set('view engine', 'ejs');

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/views', express.static(__dirname + '/public/views'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/resources', express.static(__dirname + '/public/resources'));

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

require('./server/routes/main.js')(app, express, passport);

app.listen(3001);

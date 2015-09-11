var mongoose = require('mongoose'),
    express = require('express'),
    app = express(),
    passport = require('passport'),
    expressSession = require('express-session'),
    bodyParser = require('body-parser'),
    config = require('config')
    _ = require('underscore')

mongoose.connect('mongodb://admin:admin@192.168.1.10:27017/branch');

global.$ = {}

$.getRandomString = function(length) {
  var set = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  return _.shuffle(set.split('')).splice(0, length).join('')
}

$.smtp = require('nodemailer').createTransport({
  service: config.smtp.service,
  auth: config.smtp.auth
})

//load the models
require('./server/models/project.js');
require('./server/models/projectcategory.js');
require('./server/models/user.js');
require('./server/models/userrole.js');
require('./server/models/feature.js');
require('./server/models/product.js');
require('./server/models/rating.js');

var Error = require('./server/controllers/error');

//configure passport strategies
require('./server/controllers/passport/passport.js')(passport);

//route controllers
var apiRoutes = require(__dirname+'/server/routes/api/api');
var authRoutes = require(__dirname+'/server/routes/auth');
var systemRoutes = require(__dirname+'/server/routes/system/system');

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/js', express.static(__dirname + '/public/scripts/build'));
app.use('/views', express.static(__dirname + '/public/views'));
app.use('/css', express.static(__dirname + '/public/styles/css'));
app.use('/resources', express.static(__dirname + '/public/resources'));
app.use('/attachments', express.static(__dirname + '/public/attachments'));

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb'}));

app.get('/', function(req, res){
  res.render(__dirname+'/server/views/index.jade', {isAuthenticated: req.isAuthenticated(), user: req.user});
});

var Project = require('./server/models/project.js');

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/system', systemRoutes);

app.listen(3001);

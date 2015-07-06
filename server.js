var mongoose = require('mongoose'),
    express = require('express'),
    app = express(),
    passport = require('passport'),
    expressSession = require('express-session'),
    bodyParser = require('body-parser');

mongoose.connect('mongodb://localhost:27017/branch');

//load the models
require('./server/models/project.js');
require('./server/models/projectcategory.js');
require('./server/models/user.js');
require('./server/models/userrole.js');
require('./server/models/feature.js');

//configure passport strategies
require('./server/controllers/passport/passport.js')(passport);

//route controllers
var apiRoutes = require(__dirname+'/server/routes/api/api');
var authRoutes = require(__dirname+'/server/routes/auth');
var systemRoutes = require(__dirname+'/server/routes/system/system');

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/js', express.static(__dirname + '/public/scripts/build'));
app.use('/views', express.static(__dirname + '/public/views'));
app.use('/css', express.static(__dirname + '/public/styles/css'));
app.use('/resources', express.static(__dirname + '/public/resources'));

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.get('/', function(req, res){
  res.render(__dirname+'/server/views/index.jade', {isAuthenticated: req.isAuthenticated(), user: req.user});
});

var Project = require('./server/models/project.js');

app.get('/thumbnail/:projectid', function(req, res){
  Project.findOne({_id: req.params.projectid}, function(err, result){
    if(err){
      console.log(err);
    }
    console.log(result);
    res.send(result.thumbnail);
  });
});

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/system', systemRoutes);

app.listen(3001);

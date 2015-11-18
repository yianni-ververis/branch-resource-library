var mongoose = require('mongoose'),
    express = require('express'),
    app = express(),
    passport = require('passport'),
    expressSession = require('express-session'),
    bodyParser = require('body-parser'),
    qrs = require('./SenseQRS');

//var mode = "release";
var mode = "debug";

qrs.config = {
  host: "10.211.55.3",
  app: "bf6c1ed8-69fb-4378-86c2-a1c71a2b3cc1"
};

config = require('config');

mongoose.connect('mongodb://qtdevrelations:27017/branch');
//mongoose.connect('mongodb://localhost:27017/branch');

//load the models
require('./server/models/project.js');
require('./server/models/blog.js');
require('./server/models/projectcategory.js');
require('./server/models/user.js');
require('./server/models/userrole.js');
require('./server/models/feature.js');
require('./server/models/product.js');
require('./server/models/rating.js');
require('./server/models/views.js');
require('./server/models/subscription.js');
require('./server/models/article.js');
require('./server/models/discussion.js');
require('./server/models/attachment.js');
require('./server/models/comment.js');
require('./server/models/picklist.js');
require('./server/models/picklistitem.js');

var Error = require('./server/controllers/error');

//configure passport strategies
require('./server/controllers/passport/passport.js')(passport);

//route controllers
var apiRoutes = require(__dirname+'/server/routes/api/api');
var authRoutes = require(__dirname+'/server/routes/auth');
var systemRoutes = require(__dirname+'/server/routes/system/system');
var vcRoutes = require(__dirname+'/server/routes/visualCaptcha');

app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use('/js', express.static(__dirname + '/public/scripts/build'));
app.use('/debug', express.static(__dirname + '/public/scripts/raw'));
app.use('/views', express.static(__dirname + '/public/views'));
app.use('/css', express.static(__dirname + '/public/styles/css'));
app.use('/resources', express.static(__dirname + '/public/resources'));
app.use('/attachments', express.static(__dirname + '/public/attachments'));
app.use("/qsocks", express.static(__dirname + "/node_modules/qsocks"));
app.use("/configs", express.static(__dirname + "/public/configs"));

app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb'}));

app.get('/', function(req, res){
  res.render(__dirname+'/server/views/index.jade', {isAuthenticated: req.isAuthenticated(), user: req.user, mode: mode});
});

var Project = require('./server/models/project.js');

app.use('/api', apiRoutes);
app.use('/auth', authRoutes);
app.use('/system', systemRoutes);
app.use('/visualcaptcha', vcRoutes);

app.listen(process.env.PORT || 3001);

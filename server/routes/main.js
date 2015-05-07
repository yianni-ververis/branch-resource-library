var resource = require('../controllers/resource');
var user = require('../controllers/user');
var verifyLogin = require('../js/verifyLogin');
var projectsRoutes = require('./projects');
var resourcesRoutes = require('./resource-library');
var blogRoutes = require('./blog');

module.exports = function(app, express, passport){


  app.get('/', function(req, res){
    console.log()
    resource.newest(3, function(resources){
      res.render('../server/views/index.jade', {isAuthenticated: req.isAuthenticated(), resources: resources});
    })

  });

  //projects
  app.use('/projects', projectsRoutes);

  //resources
  app.use('/resources', resourcesRoutes);

  //blog
  app.use('/blog', blogRoutes);

  //user
  //need to add edit mode capability
  app.get('/user/:userId', isLoggedIn, function(req, res){
    var userId = req.params.userId=='me' ? req.user._id : req.params.userId;
    var mode = req.params.userId=='me'||req.params.userId==req.user._id? "edit" : "read";
    user.get(userId, function(result){
      res.render('../server/views/user.jade', {isAuthenticated: req.isAuthenticated(), user: result, mode: mode});
    })
  });

  app.post('/user/save', function(req, res){
    if(req.user){
      user.update(req.user._id, req.body, function(result){
        res.redirect('/user/me');
      })
    }
  });

  //login
  app.post('/login', passport.authenticate('login'), function(req, res){
    res.redirect('/');
  });

  //signup
  app.post('/signup', passport.authenticate('signup', {
  		successRedirect: '/views/index.html',
  		failureRedirect: '/views/register.html',
  		failureFlash : true
  	}));

  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
  }
}

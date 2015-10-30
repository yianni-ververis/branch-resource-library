var User = require('../../models/user');
var UserProfile = require('../../models/userprofile');
var LoginHistory = require('../../models/loginhistory');

module.exports = function(passport){

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    UserProfile.findOne({"_id": id}).populate('role').exec(function(err, user) {
      done(err, user);
    });
  });

  //Configure login strategy
  require('./login.js')(passport, User, UserProfile, LoginHistory);

  //configure signup strategy
  require('./signup.js')(passport, User, UserProfile);
}

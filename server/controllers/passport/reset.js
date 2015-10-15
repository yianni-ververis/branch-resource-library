var LocalStrategy = require('passport-local').Strategy,
		User = require('../../models/user'),
		bCrypt = require('bcryptjs'),
		md5 = require('MD5'),
		async = require('async'),
    Error = require('../../controllers/error');

module.exports = function(req, res, next){
  var shared = {}

  async.series([

    // check user exists
    function(next) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (err){
					res.json(Error.custom(err));
				}

        if (!user) {
          res.json(Error.custom('User Not Found with email - '+req.body.email));
        }
				else{
	        shared.user = user;
	        next();
				}
      })
    },

    // create new password
    function(next) {
      shared.newPassword = $.getRandomString(6);
      next();
    },

    function(next) {

      // set the user's local credentials
      shared.user.salt = createSalt(shared.newPassword)
      shared.user.password = hashPassword(shared.newPassword, shared.user.salt)

      // save the user
      shared.user.save(function(err) {
        if (err){
					res.json(Error.custom(err));
				}
        console.log('Password reset successful');
        next();
      })
    },

    function(next) {

      // setup email data
      var mailOptions = {
        from: 'Qlik Branch <branchqliktest@gmail.com>',
        to: shared.user.email,
        subject: 'Password reset',
        text: '',
        html: 'New password for Qlik Branch is <b>' + shared.newPassword + '</b>'
      }

      // send email with new password
      $.smtp.sendMail(mailOptions, function(error, info){
        if(error){
          return console.log(error)
        }
        console.log('Message sent: ' + info.response)
        next()
      })
    }

  ], function(err) {
    if (err) return next(err.message, false)
    next(null, shared.user)
  })
}


// Generates hash using bCrypt
var createSalt = function(password) {
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
}

var hashPassword = function(password, salt) {
  return md5(md5(password) + salt)
}

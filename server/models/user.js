var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    md5 = require('MD5'),
    bCrypt = require('bcryptjs');

var userSchema = new Schema({
  password: String,
  salt: String
});

userSchema.methods = {
  authenticate: function(password) {
    return (md5(md5(password)+this.salt)) == this.password;
  },
  createSalt: function(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null)
  },
	hashPassword: function(password, salt) {
    return md5(md5(password) + salt)
  }

};

module.exports = mongoose.model('users', userSchema);

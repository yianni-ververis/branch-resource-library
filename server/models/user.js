var mongoose = require('mongoose');

module.exports = mongoose.model('users', {
  email: String,
  password: String,
  name: String,
  username: String,
  salt: String,
  field18: String, //Company name
  bio: String
});

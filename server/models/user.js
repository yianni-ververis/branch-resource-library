var mongoose = require('mongoose');

module.exports = mongoose.model('users', {
  email: String,
  password: String,
  name: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  salt: String,
  company: String, //Company name
  bio: String,
  title: String,
  city: String,
  state: String,
  country: String,
  avatar: Buffer,
  profilepicture: Buffer,
  github_user: String,
  facebook: String,
  twitter: String,
  website: String
});

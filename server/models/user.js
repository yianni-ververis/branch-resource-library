var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
  email: String,
  password: String,
  name: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: Schema.ObjectId,
    ref: 'userrole'
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

module.exports = mongoose.model('users', userSchema);

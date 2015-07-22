var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
  email: {
    type: String,
    required: true,
    uniqur: true
  },
  password: String,
  name: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: Schema.ObjectId,
    ref: 'userrole',
    default: "558c1e12f947a1a8d63b1396"
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

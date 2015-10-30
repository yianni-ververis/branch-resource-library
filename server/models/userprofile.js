var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var userProfileSchema = new Schema({
  userId: Schema.ObjectId,
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  approved: {
    type: Boolean,
    default: true
  },
  role: {
    type: Schema.ObjectId,
    ref: 'userrole',
    default: "558c1e12f947a1a8d63b1396"
  },
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
  website: String,
  createdate: {
    type: Date,
    default: Date.now
  },
  lastvisit: Number
});

module.exports = mongoose.model('userprofiles', userProfileSchema);

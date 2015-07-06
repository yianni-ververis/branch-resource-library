var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  title: String,
  pagetext: String,
  short_description: String,
  thumbnail: Buffer,
  overview: String,
  dateline: Number,
  project_site: String,
  git_clone_url: String,
  threadid: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'user'
  }
});

module.exports = mongoose.model('article', articleSchema)

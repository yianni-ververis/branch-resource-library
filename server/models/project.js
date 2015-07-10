var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
  title: String,
  pagetext: String,
  short_description: String,
  thumbnail: Buffer,
  overview: String,
  dateline: Number,
  last_updated: Number,
  last_git_check: Number, 
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
  },
  forumid: {
    type: Schema.ObjectId,
    ref: 'projectcategories'
  }
});

module.exports = mongoose.model('project', projectSchema)

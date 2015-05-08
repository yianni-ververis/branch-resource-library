var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('project', {
  title: String,
  pagetext: String,
  short_description: String,
  overview: String,
  project_site: String,
  git_clone_url: String,
  threadid: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  forumid: {
    type: Schema.ObjectId,
    ref: 'projectcategories'
  }
});

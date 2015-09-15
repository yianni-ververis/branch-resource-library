var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var projectSchema = new Schema({
  title: String,
  content: String,
  short_description: String,
  thumbnail: String,  //Url to file
  image: String,      //Url to file
  overview: String,
  createdate: Date,
  last_updated: Date,
  last_updated_num: Number,
  last_git_check: Date,
  project_site: String,
  git_clone_url: String,
  git_repo: String,
  git_user: String,
  threadid: String,
  taglist: Buffer,
  tags: String,
  votenum: Number,
  votetotal: Number,
  views:{
    type: Number,
    default: 0
  },
  comments: [{
    type: Schema.ObjectId,
    ref: 'comments'
  }],
  approved: {
    type: Boolean,
    default: false
  },
  flagged: {
    type: Boolean,
    default: false
  },
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
    ref: 'users'
  },
  forumid: {
    type: Schema.ObjectId,
    ref: 'projectcategories'
  },
  category: {
    type: Schema.ObjectId,
    ref: 'picklistitem'
  },
  product: {
    type: Schema.ObjectId,
    ref: 'picklistitem'
  },
  productversion: [{
    type: Schema.ObjectId,
    ref: 'picklistitem'
  }],
  status: {
    type: Schema.ObjectId,
    ref: 'picklistitem'
  }
});

module.exports = mongoose.model('project', projectSchema)

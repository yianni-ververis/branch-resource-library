var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var discussionSchema = new Schema({
  title: String,
  content: Buffer,
  content_plaintext: String,
  createdate: {
    type: Date,
    default: Date.now
  },
  last_updated: Date,
  last_updated_num: Number,
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  tags: String,
  hide_comment: String,
  status: {
    type: Schema.ObjectId,
    ref: "picklistitems",
    default: "56378d4ca3367986771805a6"
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  approved:{
    type: Boolean,
    default: true
  },
  flagged:{
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('discussion', discussionSchema)

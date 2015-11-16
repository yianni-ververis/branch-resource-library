var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title: String,
  short_description: String,
  content: Buffer,
  content_plaintext: String,
  tags: String,
  createdate: {
    type: Date,
    default: Date.now
  },
  createdate_num: Number,
  last_updated: Date,
  last_updated_num: Number,
  image: String,
  thumbnail: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  blogType: {
      type: Schema.ObjectId,
      ref: 'picklistitem'
  },
  hide_comment: String,
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
    default: false
  },
  flagged:{
    type: Boolean,
    default: false
  },
  deleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('blog', blogSchema)

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new Schema({
  title: String,
  pagetext: String,
  short_description: String,
  thumbnail: Buffer,
  overview: String,
  dateline: Number,
  threadid: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  }
});

module.exports = mongoose.model('article', articleSchema)

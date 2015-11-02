var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title: String,
  content: Buffer,
  createdate: {
    type: Date,
    default: Date.now
  },
  image: String,
  thumbnail: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  blogType: {
      type: Schema.ObjectId,
      ref: 'picklistitems'
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
    default: false
  },
  flagged:{
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('blog', blogSchema)

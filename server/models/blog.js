var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title: String,
  content: Buffer,
  createdate: Date,
  image: String,
  thumbnail: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  blogType: {
      type: Schema.ObjectId,
      ref: 'picklistitems'
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'user'
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

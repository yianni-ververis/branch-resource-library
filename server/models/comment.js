var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  content: Buffer,
  pagetext: Buffer,
  createdate: {
    type: Date,
    default: Date.now
  },
  createdate_num: Number,
  entityId: Schema.ObjectId,
  entity: String,
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
  },
  approved:{
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('comment', commentSchema)

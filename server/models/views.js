var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var viewSchema = new Schema({
  entityId: {
    type: Schema.ObjectId
  },
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  createdate: {
    type: Date,
    default: Date.now
  },
  ip: String,
  viewNum: {
    type: Number,
    default: 1
  }
});

module.exports = mongoose.model('views', viewSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var viewSchema = new Schema({
  entityId: {
    type: Schema.ObjectId
  },
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createdate: {
    type: Date,
    default: Date.now
  },
  ip: String
});

module.exports = mongoose.model('views', viewSchema);

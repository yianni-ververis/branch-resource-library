var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var flagSchema = new Schema({
  createdate: {
    type: Date,
    default: Date.now
  },
  entityId: Schema.ObjectId,
  entity: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  flagType: String,
  comment: String,
  flagged: Boolean
});

module.exports = mongoose.model('flag', flagSchema)

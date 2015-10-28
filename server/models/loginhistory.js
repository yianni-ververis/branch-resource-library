var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loginhistorySchema = new Schema({
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createdate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('loginhistory', loginhistorySchema)

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var loginhistorySchema = new Schema({
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  createdate: {
    type: Date,
    default: Date.now
  },
  createdate_num: Number,
});

module.exports = mongoose.model('loginhistory', loginhistorySchema)

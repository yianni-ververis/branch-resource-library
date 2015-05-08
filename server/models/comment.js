var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('comment', {
  pagetext: String,
  threadid: Schema.ObjectId,
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  }
});

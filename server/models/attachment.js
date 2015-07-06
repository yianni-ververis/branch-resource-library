var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('attachment', {
  postid: {
    type: Schema.ObjectId
  },
  type: String,
  filedata: Buffer
});

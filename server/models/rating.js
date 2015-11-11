var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ratingSchema = new Schema({
  entityId: {
    type: Schema.ObjectId
  },
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  createdate: Date,
  createdate_num: Number,
  rating: Number
});

module.exports = mongoose.model('rating', ratingSchema)

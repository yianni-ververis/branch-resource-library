var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ratingSchema = new Schema({
  entityId: {
    type: Schema.ObjectId
  },
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createdate: Date,
  rating: Number
});

module.exports = mongoose.model('rating', ratingSchema)
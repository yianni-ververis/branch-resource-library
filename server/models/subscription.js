var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subscriptionSchema = new Schema({
  entityId: {
    type: Schema.ObjectId
  },
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createdate: Date
});

module.exports = mongoose.model('subscription', subscriptionSchema)

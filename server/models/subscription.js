var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var subscriptionSchema = new Schema({
  entityId: {
    type: Schema.ObjectId
  },
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  createdate: Date
});

module.exports = mongoose.model('subscription', subscriptionSchema)

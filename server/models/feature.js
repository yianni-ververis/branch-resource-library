var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var FeatureSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contentType: {
    type: String,
    required: true
  },
  comment: String,
  entityId: Schema.ObjectId,
  createuser: {
    type: Schema.ObjectId,
    ref: 'user'
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'users'
  }
});

module.exports = mongoose.model('feature', FeatureSchema);

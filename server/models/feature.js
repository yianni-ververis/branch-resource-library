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
  title: String,
  comment: String,
  image: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  entityId: Schema.ObjectId,
  createuser: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'users'
  }
});

module.exports = mongoose.model('feature', FeatureSchema);

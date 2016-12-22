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
  link: String,
  image: String,
  userid: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  entityId: Schema.ObjectId,
  createuser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  }
});

module.exports = mongoose.model('feature', FeatureSchema);

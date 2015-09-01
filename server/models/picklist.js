var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var picklistSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'user'
  }
});

module.exports = mongoose.model('picklist', picklistSchema);

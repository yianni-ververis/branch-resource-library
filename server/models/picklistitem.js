var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var picklistItemSchema = new Schema({
  picklistId: Schema.ObjectId,
  name: {
    type: String,
    required: true,  
    trim: true
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'user'
  }
});

module.exports = mongoose.model('picklistitem', picklistItemSchema);

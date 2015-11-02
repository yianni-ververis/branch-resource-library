var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('products', {
  name: String,
  edituser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'userprofiles'
  },
});

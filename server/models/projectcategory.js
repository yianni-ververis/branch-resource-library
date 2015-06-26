var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('projectcategories', {
  title: String,
  description: String,
  edituser: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'users'
  },
});

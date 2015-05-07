var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('resources', {
  name: String,
  short_description: String,
  author: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  difficulty: Number,
  content: String,
  tags: Array
});

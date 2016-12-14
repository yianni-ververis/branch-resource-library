var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var blogSchema = new Schema({
  title: String,
  short_description: String,
  mediumId: String,
  content: String,
  plaintext: String,
  link: String,
  image: String,
  tags: String,
  published: Date,
  published_num: Number,
  author: String,
  checksum: String,
  approved: Boolean
});

module.exports = mongoose.model('blog', blogSchema)

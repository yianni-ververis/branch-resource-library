var comment = require('../models/comment');

module.exports = {
  create: function(){

  },
  get: function(id, callbackFn){
    comment.findOne({_id: id})
      .populate('userid')
      .exec(function(err, result){
        callbackFn.call(null, result);
    });

  },
  getProjectComments: function(id,  callbackFn){
    console.log('getting comments for - '+id);
    comment.find({threadid: id})
      .populate('userid')
      .exec(function(err, comments){
        callbackFn.call(null, comments);
    });
  },
  getAll: function(callbackFn){

  },
  update: function(){

  }
}

var project = require('../models/project');

module.exports = {
  create: function(){

  },
  get: function(id, callbackFn){
    project.findOne({_id: id})
      .populate('userid')
      .populate('forumid')
      .exec(function(err, result){
        callbackFn.call(null, result);
    });

  },
  getAll: function(callbackFn){
    project.find()
      .populate('userid')
      .populate('forumid')
      .exec(function(err, projects){
        callbackFn.call(null, projects);
    });
  },
  update: function(){

  }
}

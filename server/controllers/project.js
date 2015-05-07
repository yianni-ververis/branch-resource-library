var project = require('../models/project');

module.exports = {
  create: function(){

  },
  get: function(id, callbackFn){
    project.findOne({_id: id}, function(err, result){
      project.populate(result, {path: 'userid'}, function(err, result){
        callbackFn.call(null, result);
      })
    });
  },
  getAll: function(callbackFn){
    project.find(function(err, projects){
      project.populate(projects, {path: 'userid'}, function(err, projects){
        callbackFn.call(null, projects);
      });
    });
  },
  update: function(){

  }
}

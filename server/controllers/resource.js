var resource = require('../models/resource');

module.exports = {
  create: function(){

  },
  newest: function(n, callbackFn){    
    resource.find(function(err, resources){
      if(err) console.log(err)
      resource.populate(resources, {path: 'author'}, function(err, resources){
        console.log(resources);
        callbackFn.call(null, resources);
      })
    });
  },
  get: function(id, callbackFn){
    resource.findOne({_id: id}, function(err, result){
      resource.populate(result, {path: 'author'}, function(err, result){
        callbackFn.call(null, result);
      })
    });
  },
  update: function(){

  }
}

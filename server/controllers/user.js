var user = require('../models/user');

module.exports = {
  create: function(){

  },
  get: function(id, callbackFn){
    user.findOne({_id: id}, function(err, result){
      if(err) console.log(err)
      callbackFn.call(null, result);
    });
  },
  update: function(id, data, callbackFn){
    user.update({_id: id}, data, function(err, result){
      if(err) console.log(err)
      callbackFn.call(null, result);
    });
  }
}

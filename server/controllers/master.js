var Error = require('./error');

module.exports = {
  get: function(query, entity, callbackFn){
    entity.model.find(query).populate(entity.populates).exec(function(err, results){
      if(err){
        console.log(err);
        callbackFn.call(null, Error.errorGetting(err.message));
      }
      else{
        callbackFn.call(null, results);
      }
    });
  },
  count: function(query, entity, callbackFn){
    console.log(entity);
    entity.model.count(query, function(err, result){
      if(err){
        console.log(err);
        callbackFn.call(null, Error.errorGetting(err.message));
      }
      else{
        callbackFn.call(null, result);
      }
    });
  },
  save: function(query, data, entity, callbackFn){
    if(query){ //update
      entity.model.findOneAndUpdate(query, data, function(err, result){
        if(err){
          console.log(err);
          callbackFn.call(null, Error.errorSaving(err.message));
        }
        else{
          callbackFn.call(null, result);
        }
      });
    }
    else{ //new
      entity.model.create(data, function(err, result){
        if(err){
          console.log(err);
          callbackFn.call(null, Error.errorSaving(err.errors.status));
        }
        else {
          entity.model.findOne({_id:result.id}).populate(entity.populates).exec(function(err, result){
            if(err){
              console.log(err);
              callbackFn.call(null, Error.errorSaving(err.errors.status));
            }
            else{
              callbackFn.call(null, result);
            }
          });
        }
      });
    }
  },
  delete: function(query, entity, callbackFn){
    entity.model.remove(query, function(err, result){
      if(err){
        console.log(err);
        callbackFn.call(null, Error.errorDeleting(err.message));
      }
      else{
        callbackFn.call(null, result);
      }
    });
  }
};

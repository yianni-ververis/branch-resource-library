var Error = require('./error');

module.exports = {
  get: function(query, parsedQuery, entity, callbackFn){
    entity.model.find(parsedQuery).populate(entity.populates).sort(entity.sort).skip(entity.skip).limit(entity.limit).exec(function(err, results){
      if(err){
        console.log(err);
        callbackFn.call(null, Error.errorGetting(err.message));
      }
      else{
        //establish how many rows are in the collection for the given query
        entity.model.count(parsedQuery, function(err, count){
          if(err){
            console.log(err);
            callbackFn.call(null, Error.errorGetting(err.message));
          }
          else{
            var responseObj = {};
            var pageStart = 0;
            var pageNum = 1;
            responseObj.total = count;
            if(entity.limit){
              responseObj.pages = [];
              while(pageStart < count){
                responseObj.pages.push({
                  pageNum: pageNum,
                  pageStart: pageStart,
                  pageEnd: Math.min(parseInt(pageStart)+parseInt(entity.limit), count)
                })
                pageNum++;
                pageStart+=parseInt(entity.limit);
              }
              responseObj.currentPage = (parseInt(entity.skip) / parseInt(entity.limit)) + 1 || 1;
            }
            responseObj.query = query;
            responseObj.skip = parseInt(entity.skip) + parseInt(entity.limit);
            responseObj.limit = entity.limit;
            responseObj.data = results
            callbackFn.call(null, responseObj);
          }
        })
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

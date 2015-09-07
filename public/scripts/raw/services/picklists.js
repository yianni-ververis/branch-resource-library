app.service('picklistService', ['$resource', 'resultHandler', function($resource, resultHandler){
  var Picklist = $resource("api/picklists/:picklistId", {picklistId: "@picklistId"});
  var PicklistItem = $resource("api/picklistitems/:picklistitemId", {picklistitemId: "@picklistitemId"});

  this.getPicklistItems = function(picklistName, callbackFn){
    Picklist.get({name: picklistName}, function(result){
      if(resultHandler.process(result)){
        if(result.data && result.data[0]){
          PicklistItem.get({picklistId: result.data[0]._id}, function(result){
            if(resultHandler.process(result)){
              callbackFn.call(null, result.data);
            }
          });
        }
      }
    });
  };

}]);

app.service('publisher', ["$rootScope", function($rootScope){
  var that = this;
  this.catalog = {};

  this.subscribe = function(eventName, id, callbackFn){
    if(!that.catalog[eventName]){
      that.catalog[eventName] = {};
    }
    if(!that.catalog[eventName][id]){
      that.catalog[eventName][id] = {fn: callbackFn};
    }
  };

  this.publish = function(eventName, data){
    if(that.catalog[eventName]){
      for(var sub in that.catalog[eventName]){
        that.catalog[eventName][sub].fn.call(null, data);
      }      
    }
  };
}]);

app.service('lastError', ['$resource', function($resource){
  var LastError = $resource("system/lasterror");

  this.checkForErrors = function(callbackFn){
    LastError.get({}, function(result){
      callbackFn.call(null, result);
    });
  };

}]);

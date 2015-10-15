app.controller("authController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", function($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications){
  var Login = $resource("auth/login");
  var Signup = $resource("auth/signup");
  var Reset = $resource("auth/reset")

  if($stateParams.url){
    $scope.returnUrl = $stateParams.url.replace(/%2F/gi, '');
  }

  $scope.login = function(){
    Login.save({
      username: $scope.loginusername,
      password: $scope.loginpassword
    }, function(result){
      if(resultHandler.process(result)){
        userManager.refresh();
        window.location = "#" + $scope.returnUrl || "/";
      }
      else{
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    });
  };

  $scope.signup = function(){
    Signup.save({
      username: $scope.username,
      password: $scope.password,
      email: $scope.email
    }, function(result) {
      if(resultHandler.process(result)){
        userManager.refresh();
        window.location = "#" + $scope.returnUrl || "/";
      }
      else{
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    })
  };

  $scope.reset = function() {
    Reset.save({
      email: $scope.email2
    }, function(result) {
      if(resultHandler.process(result)){
        userManager.refresh();
        window.location = "#" + $scope.returnUrl || "/";
      }
      else{
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    })
  };

}]);

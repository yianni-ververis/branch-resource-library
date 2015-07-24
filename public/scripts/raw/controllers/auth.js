app.controller("authController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
  var Login = $resource("auth/login");
  var Signup = $resource("auth/signup");

  if($stateParams.url){
    $scope.returnUrl = $stateParams.url;
  }

  $scope.login = function(){
    Login.save({
      username: $scope.username,
      password: $scope.password
    }, function(result){
      if(resultHandler.process(result)){
        userManager.refresh();
        window.location = "#" + $scope.returnUrl || "/";
      }
    });
  };

  $scope.signup = function(){

  };

}]);

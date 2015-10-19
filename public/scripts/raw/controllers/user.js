app.controller("userController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", function($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications){
  var User = $resource("api/users/:userId", {userId: "@userId"});
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var ChangePassword = $resource("auth/change");

  $scope.query = {};
  $scope.projectCount = 0;

  if($stateParams.userId){
    $scope.query.userId = $stateParams.userId;
    Project.get({projectId:'count', userid: $stateParams.userId}, function(result){
      if(resultHandler.process(result)){
        $scope.projectCount = result.count;
      }
    });

  }

  $scope.changePassword = function(){
    ChangePassword.save({
      oldPassword: $scope.oldpassword,
      password: $scope.password
    }, function(result){
      if(resultHandler.process(result)){
        $scope.oldpassword = "";
        $scope.password = "";
        $scope.confirm = "";
        notifications.notify("Your password was successfully changed. ", null, {sentiment: 'positive'});
      }
      else{
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    });
  };


  $scope.getUserData = function(query, append){
    User.get(query, function(result){
      if(resultHandler.process(result)){
        if(append && append==true){
          $scope.users = $scope.users.concat(result.data);
        }
        else{
          $scope.users = result.data;
        }
        $scope.userInfo = result;
        delete $scope.userInfo["data"];
      }
    });
  };

  $scope.getUserData($scope.query);

}]);

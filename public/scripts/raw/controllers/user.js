app.controller("userController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var User = $resource("api/users/:userId", {userId: "@userId"});
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});

  $scope.query = {};
  $scope.projectCount = 0;

  if($stateParams.userId){
    $scope.query.userId = $stateParams.userId;
    Project.get({projectId:'count', userid: $stateParams.userId}, function(result){
      if(resultHandler.process(result)){
        $scope.projectCount = result.data;
      }
    });

  }


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

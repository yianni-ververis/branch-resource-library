app.controller("userController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "searchExchange", function($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, searchExchange){
  var User = $resource("api/users/:userId", {userId: "@userId"});
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var Blog = $resource("api/blogs/:blogId", {projectId: "@blogId"});
  var ChangePassword = $resource("auth/change");

  $scope.query = {};
  $scope.projectCount = 0;

  var defaultSelection = [];

  if($stateParams.userId){
    $scope.query.userId = $stateParams.userId;
    Project.get({projectId:'count', userid: $stateParams.userId}, function(result){
      if(resultHandler.process(result)){
        $scope.projectCount = result.count;
      }
    });
    Blog.get({blogId:'count', userid: $stateParams.userId}, function(result){
      if(resultHandler.process(result)){
        $scope.blogCount = result.count;
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
        $scope.setTab(0);
        delete $scope.userInfo["data"];

        if($state.current.name=="users.detail"){          
          userManager.refresh(function(hasUser){
            if(!hasUser){
              defaultSelection.push({
                field: "approved",
                values: [{qText: "True"}]
              });
            }
            else{
              if(!userManager.canApprove('projects')){
                defaultSelection.push({
                  field: "approved",
                  values: [{qText: "True"}]
                });
              }
            }
            searchExchange.init(defaultSelection);
          });
        }
      }
    });
  };

  $scope.activeTab = 0;

  $scope.setTab = function(index){
    $scope.activeTab = index;
    //searchExchange.clear();
  };

  $scope.getUserData($scope.query);

}]);

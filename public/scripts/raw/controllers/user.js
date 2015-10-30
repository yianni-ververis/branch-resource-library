app.controller("userController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "searchExchange", function($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, searchExchange){
  var User = $resource("api/userprofile/:userId", {userId: "@userId"});
  var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
  var Blog = $resource("api/blog/:blogId", {projectId: "@blogId"});
  var ChangePassword = $resource("auth/change");

  console.log('firing user controller');

  $scope.query = {};
  $scope.projectCount = 0;

  $scope.$on("cleared", function(){
    searchExchange.init(defaultSelection);
  })

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
      }
    });
  };

  $scope.activeTab = 0;

  $scope.setTab = function(index){
    $scope.activeTab = index;
    //searchExchange.clear();
  };

  if($state.current.name=="users" || $state.current.name=="users.detail"){
    userManager.refresh(function(hasUser){
      if(!hasUser){
        defaultSelection.push({
          field: "approved",
          values: [{qText: "True"}]
        });
      }
      else{
        if(!userManager.canApprove('project')){
          defaultSelection.push({
            field: "approved",
            values: [{qText: "True"}]
          });
        }
      }
      console.log('adding user lock');
      defaultSelection.push({
        field: "userId",
        values: [{qText: $stateParams.userId}]
      });
      console.log('firing search init');
      searchExchange.clear(true);
    });
    $scope.getUserData($scope.query);
  }
  else if($state.current.name=="users.addedit"){
    //need to implement edit stuff
  }
  else{
    //shouldn't reach here

  }

}]);

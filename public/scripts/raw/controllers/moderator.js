app.controller("moderatorController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "searchExchange", "confirm", function($scope, $resource, $state, $stateParams, userManager, resultHandler, searchExchange, confirm){
  var Flags = $resource("api/flag/:flagId", {flagId: "@flagId"});

  //check to see that a user is logged in and that they have the correct permissions
  var entities = [
    "project",
    "blog",
    "discussion",
    "comment",
    "user"
  ]

  $scope.isModerator = false;

  $scope.activeTab = 0;

  $scope.showComments = false;

  $scope.commentsType;
  $scope.commentsTitle;
  $scope.comments = [];

  var defaultSelection;

  $scope.$on("cleared", function(){
    searchExchange.init(defaultSelection);
  });

  $scope.setTab = function(index){
    $scope.activeTab = index;
    searchExchange.clear(true);
  };

  $scope.closeComments = function(){
    $scope.showComments = false;
  };

  $scope.$on('clearFlags', function(event, params){
    var flagType = params.flagCount ? 'flag' : 'spam';
    Flags.save({flagId:params._id, entityId: params.entityId, flagType: flagType}, {flagged: false}, function(result){
      if(resultHandler.process(result)){

      }
    });
  });

  $scope.$on('viewComments', function(event, params){
    console.log(params);
    $scope.commentsTitle = params.title;
    var flagType = params.flagCount ? 'flag' : 'spam';
    $scope.commentType = params.flagCount ? 'Flag' : 'Spam';
    Flags.get({entityId: params.entityId, flagType: flagType}, function(results){
      if(resultHandler.process(results)){
        $scope.showComments = true;
        $scope.comments = results.data;
      }
    });
  });

  $scope.$on("$stateChangeSuccess", function(){
    if(!userManager.hasUser()){
      userManager.refresh(function(hasUser){
        if(!hasUser){
          window.location = "#login?url=moderator";
        }
        else{
          for(var i=0;i<entities.length;i++){
            if(userManager.canApprove(entities[i])){
              $scope.isModerator = true;
              defaultSelection = [{
                field: "DocType",
                values: [{qText: entities[i]}]
              }]
            }
          }
        }
        if(!$scope.isModerator){
            window.location = "#/";
        }
        //this effectively initiates the results
        searchExchange.clear(true);
      });
    }
  });

  $scope.setTab(0);

}]);

app.controller("homeController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var Feature = $resource("api/features/:featureId", {featureId: "@featureId"});
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var Article = $resource("api/articles/:articleId", {articleId: "@articleId"});

  Feature.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.features = result.data;
      $scope.featureInfo = result;
      delete $scope.featureInfo["data"];

      //get the featured content
      for(var f in $scope.features){
        var entityId = $scope.features[f].entityId;
        switch ($scope.features[f].name){
          case "project":
            Project.get({projectId: entityId}, function(result){
              if(resultHandler.process(result)){
                $scope.featuredProject = result.data[0];
              }
            });
            break;
        }
      }
    }
  });

}]);

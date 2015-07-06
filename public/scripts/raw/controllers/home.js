app.controller("homeController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var Feature = $resource("api/features/:featureId", {featureId: "@featureId"});
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var Article = $resource("api/articles/:articleId", {articleId: "@articleId"});

  $scope.featuredProject = {};
  $scope.featuredArticle = {};

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
          $scope.featuredProject.comment = $scope.features[f].comment;
            Project.get({projectId: entityId}, function(result){
              if(resultHandler.process(result)){
                $scope.featuredProject.project = result.data[0];
              }
            });
            break;
          case "article":
          $scope.featuredArticle.comment = $scope.features[f].comment;
            Article.get({articleId: entityId}, function(result){
              if(resultHandler.process(result)){
                $scope.featuredArticle.article = result.data[0];
              }
            });
            break;
        }
      }
    }
  });

  //Get the latest 5 projects
  Project.get({sort: 'dateline', sortOrder:'-1', limit:'3'}, function(result){
    if(resultHandler.process(result)){
      $scope.latestProjects = result.data;
    }
  });

  Article.get({sort: 'dateline', sortOrder:'-1', limit:'3'}, function(result){
    if(resultHandler.process(result)){
      $scope.latestArticles = result.data;
    }
  });

}]);

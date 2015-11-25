app.controller("homeController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
  var Feature = $resource("api/feature/:featureId", {featureId: "@featureId"});
  var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
  var Article = $resource("api/blog/:blogId", {blogId: "@blogId"});

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
            $scope.featuredProject = $scope.features[f];
            break;
          case "article":
            $scope.featuredArticle = $scope.features[f];
            break;
        }
      }
    }
  });

  //Get the latest 5 projects
  Project.get({sort: 'createdate_num', sortOrder:'-1', limit:'3'}, function(result){
    if(resultHandler.process(result)){
      $scope.latestProjects = result.data;
    }
  });

  Article.get({sort: 'createdate_num', sortOrder:'-1', limit:'3'}, function(result){
    if(resultHandler.process(result)){
      $scope.latestArticles = result.data;
    }
  });

}]);

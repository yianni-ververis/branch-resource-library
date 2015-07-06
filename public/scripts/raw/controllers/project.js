app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var ProjectCategory = $resource("api/projectcategories/:projectCategoryId", {projectCategoryId: "@projectCategoryId"});

  $scope.permissions = userPermissions;

  Project.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projects = result.data;
      $scope.projectInfo = result;
      delete $scope.projectInfo["data"];
    }
  });

  ProjectCategory.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projectCategories = result.data;
      $scope.projectCategoryInfo = result;
      delete $scope.projectCategoryInfo["data"];
    }
  });
}]);

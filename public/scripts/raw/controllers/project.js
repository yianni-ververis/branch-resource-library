app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var ProjectCategory = $resource("api/projectcategories/:projectCategoryId", {projectCategoryId: "@projectCategoryId"});

  $scope.permissions = userPermissions;

  ProjectCategory.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projectCategories = result.data;
      $scope.projectCategoryInfo = result;
      delete $scope.projectCategoryInfo["data"];
    }
  });

  $scope.getPageNumberAsArray = function(){

  };

  $scope.getProjectData = function(recStartIndex){
    Project.get({skip: recStartIndex}, function(result){
      if(resultHandler.process(result)){
        $scope.projects = result.data;
        $scope.projectInfo = result;
        delete $scope.projectInfo["data"];
      }
    });
  };

  $scope.pageInRange = function(pageIndex){
    var minPage, maxPage;
    if($scope.projectInfo.currentPage <= 2){
      minPage = 1;
      maxPage = 5
    }
    else if ($scope.projectInfo.currentPage >= $scope.projectInfo.pages.length - 3) {
      minPage = $scope.projectInfo.pages.length - 6;
      maxPage = $scope.projectInfo.pages.length - 1;
    }
    else{
      minPage = $scope.projectInfo.currentPage - 2;
      maxPage = $scope.projectInfo.currentPage + 2;
    }
    return (pageIndex >= minPage && pageIndex <= maxPage);
  }

  $scope.getProjectData(0); //get initial data set
}]);

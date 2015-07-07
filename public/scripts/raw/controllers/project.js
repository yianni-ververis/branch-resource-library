app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var ProjectCategory = $resource("api/projectcategories/:projectCategoryId", {projectCategoryId: "@projectCategoryId"});

  $scope.permissions = userPermissions;
  $scope.pageSize = 20;

  console.log('params - ',$stateParams);

  $scope.sort = {};

  $scope.sortOptions = {
    dateline: {
      name: "Last Updated",
      order: -1,
      field: "dateline"
    },
    title: {
      name: "A-Z",
      order: 1,
      field: "title"
    },
    lastpost: {
      name: "Most recent comments",
      order: -1,
      field: "lastpost"
    }
  };

  $scope.query = {
    limit: $scope.pageSize //overrides the server side setting
  };
  if($stateParams.page){
    $scope.query.skip = ($stateParams.page-1) * $scope.pageSize;
  }
  if($stateParams.sort){
    $scope.query.sort = $scope.sortOptions[$stateParams.sort].field;
    $scope.query.sortOrder = $scope.sortOptions[$stateParams.sort].order;
  }

  ProjectCategory.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projectCategories = result.data;
      $scope.projectCategoryInfo = result;
      delete $scope.projectCategoryInfo["data"];
    }
  });

  $scope.applySort = function(){
    window.location = "#projects?page="+$scope.projectInfo.currentPage+"&sort="+ $scope.sort.field;
  };

  $scope.getProjectData = function(query){
    Project.get(query, function(result){
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
    else if ($scope.projectInfo.currentPage >= $scope.projectInfo.pages.length - 2) {
      minPage = $scope.projectInfo.pages.length - 5;
      maxPage = $scope.projectInfo.pages.length;
    }
    else{
      minPage = $scope.projectInfo.currentPage - 2;
      maxPage = $scope.projectInfo.currentPage + 2;
    }
    return (pageIndex >= minPage && pageIndex <= maxPage);
  }

  $scope.getProjectData($scope.query); //get initial data set
}]);

app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", "paging", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler, paging){
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var ProjectCategory = $resource("api/projectcategories/:projectCategoryId", {projectCategoryId: "@projectCategoryId"});

  $scope.permissions = userPermissions;
  $scope.pageSize = 20;
  $scope.projects = [];

  console.log('params - ',$stateParams);

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

    $scope.sort = $scope.sortOptions.dateline;

  $scope.query = {
    limit: $scope.pageSize //overrides the server side setting
  };
  if($stateParams.page){
    $scope.query.skip = ($stateParams.page-1) * $scope.pageSize;
  }
  if($stateParams.sort){
    $scope.sort = $scope.sortOptions[$stateParams.sort];
    $scope.query.sort = $scope.sort.field;
    $scope.query.sortOrder = $scope.sort.order;
  }
  if($stateParams.projectId){
    $scope.query.projectId = $stateParams.projectId;
  }

  ProjectCategory.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projectCategories = result.data;
      $scope.projectCategoryInfo = result;
      delete $scope.projectCategoryInfo["data"];
    }
  });

  $scope.getProjectData = function(query){
    Project.get(query, function(result){
      if(resultHandler.process(result)){
        $scope.projects = result.data;
        $scope.projectInfo = result;
        delete $scope.projectInfo["data"];
      }
    });
  };

  $scope.getPageText = function(){
    if($scope.projects[0] && $scope.projects[0].pagetext){
      return marked($scope.projects[0].pagetext);
    }
  };

  $scope.getProjectData($scope.query); //get initial data set
}]);

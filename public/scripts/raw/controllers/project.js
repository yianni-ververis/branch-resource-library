app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", "paging", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler, paging){
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var Category = $resource("api/projectcategories/:projectCategoryId", {projectCategoryId: "@projectCategoryId"});
  var Product = $resource("api/products/:productId", {productId: "@productId"});

  $scope.permissions = userPermissions;
  $scope.pageSize = 20;
  $scope.projects = [];
  $scope.url = "projects";

  $scope.stars = new Array(5);

  console.log('params - ',$stateParams);

  $scope.sortOptions = {
    dateline: {
      id: "dateline",
      name: "Last Updated",
      order: -1,
      field: "dateline"
    },
    rating:{
      id: "rating",
      name: "Highest Rated",
      order: [-1,-1],
      field:["votenum", "votetotal"]
    },
    lastpost: {
      id: "lastpost",
      name: "Most recent comments",
      order: -1,
      field: "lastpost"
    },
    title: {
      id: "title",
      name: "A-Z",
      order: 1,
      field: "title"
    }
  };

  $scope.sort = $scope.sortOptions.dateline;
  $scope.categoryId = "";
  $scope.productId = "";

  $scope.query = {
    limit: $scope.pageSize //overrides the server side setting
  };
  if($stateParams.page && !$stateParams.projectId){
    $scope.query.skip = ($stateParams.page-1) * $scope.pageSize;
  }
  if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
    $scope.sort = $scope.sortOptions[$stateParams.sort];
    $scope.query.sort = $scope.sort.field;
    $scope.query.sortOrder = $scope.sort.order;
  }
  if($stateParams.projectId){
    $scope.query.projectId = $stateParams.projectId;
  }
  if($stateParams.product){
    $scope.productId = $stateParams.product;
    $scope.query.product = $stateParams.product;
  }
  if($stateParams.category){
    $scope.categoryId = $stateParams.category;
    $scope.query.forumid = $stateParams.category;
  }

  Category.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projectCategories = result.data;
      $scope.projectCategoryInfo = result;
      delete $scope.projectCategoryInfo["data"];
    }
  });

  Product.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.projectProducts = result.data;
      $scope.projectProductInfo = result;
      delete $scope.projectProductInfo["data"];
    }
  });

  $scope.getProjectData = function(query){
    console.log(query);
    Project.get(query, function(result){
      if(resultHandler.process(result)){
        $scope.projects = result.data;
        $scope.projectInfo = result;
        delete $scope.projectInfo["data"];
      }
    });
  };

  $scope.getRating = function(total, count){
    if(count && count > 0){
      return Math.round(parseInt(total) / parseInt(count));
    }
    else{
      return 0;
    }
  }

  $scope.getBuffer = function(binary){
    return _arrayBufferToBase64(binary);
  };

  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary ;
  }

  $scope.getPageText = function(){
    if($scope.projects[0] && $scope.projects[0].pagetext){
      return marked($scope.projects[0].pagetext);
    }
  };

  $scope.getProjectData($scope.query); //get initial data set
}]);

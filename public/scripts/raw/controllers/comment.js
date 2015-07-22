app.controller("commentController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var Comment = $resource("api/comments/:commentId", {commentId: "@commentId"});

  $("#summernote").summernote();

  $scope.comments = [];
  $scope.pageSize = 10;

  $scope.sortOptions = {
    newest: {
      id: "newest",
      name: "Newest",
      order: -1,
      field: "dateline"
    },
    oldest: {
      id: "oldest",
      name: "Oldest",
      order: 1,
      field: "dateline"
    }
  };

  $scope.commentQuery = {
    limit: $scope.pageSize //overrides the server side setting
  };

  $scope.sort = $scope.sortOptions.newest;

  if($stateParams.page){
    $scope.commentQuery.skip = ($stateParams.page-1) * $scope.pageSize;
  }
  if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
    $scope.sort = $scope.sortOptions[$stateParams.sort];
    $scope.commentQuery.sort = $scope.sort.field;
    $scope.commentQuery.sortOrder = $scope.sort.order;
  }

  $scope.getCommentData = function(query){
    Comment.get(query, function(result){
      if(resultHandler.process(result, null, true)){
        $scope.comments = result.data;
        $scope.commentInfo = result;
        delete $scope.commentInfo["data"];
      }
    });
  };

  if($stateParams.projectId){
    $scope.commentQuery.threadid = $stateParams.projectId;
    $scope.url = "projects/" + $stateParams.projectId;
    $scope.getCommentData($scope.commentQuery);
  }

  $scope.getCommentText = function(text){
    var buffer = _arrayBufferToBase64(text.data);
    return marked(buffer);
  }

  $scope.saveComment = function(){
    var commentText = $("#summernote").code();
    Comment.save({}, {
      threadid: $stateParams.projectId,
      pagetext: commentText,
      commenttext: commentText
    }, function(result){
      resultHandler.process(result, "Create");
    })
  }

  function bin2String(array) {
    return String.fromCharCode.apply(String, array);
  }

  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary ;
  }


}]);

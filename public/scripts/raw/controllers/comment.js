app.controller("commentController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var Comment = $resource("api/comments/:commentId", {commentId: "@commentId"});

  $scope.comments = [];

  $scope.getCommentData = function(query){
    Comment.get(query, function(result){
      if(resultHandler.process(result)){
        $scope.comments = result.data;
        $scope.commentInfo = result;
        delete $scope.commentInfo["data"];
      }
    });
  };

  if($stateParams.projectId){
    $scope.getCommentData({threadid: $stateParams.projectId});
  }

}]);

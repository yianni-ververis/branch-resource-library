app.controller("commentController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
  var Comment = $resource("api/comments/:commentId", {commentId: "@commentId"});

  $("#summernote").summernote();

  $scope.comments = [];

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
    $scope.getCommentData({threadid: $stateParams.projectId});
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

app.controller("commentController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
  var Comment = $resource("api/comments/:commentId", {commentId: "@commentId"});
  var Entity = $resource("api/"+$scope.entity+"/"+$scope.entityid+"/:path", {path: "@path"});

  $scope.userManager = userManager;

  $("#summernote").summernote({
    height: 100
  });

  $scope.comments = [];
  $scope.pageSize = 10;

  console.log($scope.entityid);

  $scope.$watch("entityid", function(newVal, oldVal){
    console.log('changed to' + newVal);
    console.log('changed from' + oldVal);
  });

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

  if($scope.entityid){
    $scope.commentQuery.entityId = $scope.entityid;
    $scope.url = $scope.entity + "/" + $scope.entityId;
    $scope.getCommentData($scope.commentQuery);
  }

  $scope.getCommentText = function(text){
    if(text && text.data){
      var buffer = _arrayBufferToBase64(text.data);
      return marked(buffer);
    }
    else{
      return "";
    }
  }

  $scope.saveComment = function(){
    var commentText = $("#summernote").code();
    Comment.save({}, {
      entityId: $scope.entityid,
      content: commentText
    }, function(result){
      if(resultHandler.process(result)){
        $("#summernote").code("");
        $scope.comments.push(result);
        //update comment count on entity
        Entity.save({path:"updatecommentcount"}, {value: 1}, function(result){
          resultHandler.process(result);
        });
      }
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

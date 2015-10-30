app.controller("commentController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
  var Comment = $resource("api/comment/:commentId", {commentId: "@commentId"});
  var Entity = $resource("api/"+$scope.entity+"/"+$scope.entityid+"/:path", {path: "@path"});

  $scope.userManager = userManager;

  $("#summernote").summernote({
    height: 100
  });

  $scope.comments = [];
  $scope.pageSize = 10;

  $scope.sortOptions = {
    newest: {
      id: "newest",
      name: "Newest",
      order: -1,
      field: "createdate"
    },
    oldest: {
      id: "oldest",
      name: "Oldest",
      order: 1,
      field: "createdate"
    }
  };

  $scope.getFlagged = function(){
    Comment.get({commentId: "flagged", entityId: $scope.entityid}, {
      limit: 100  //if we have more than 100 flagged items we have some housekeeping to do
    }, function(result){
      if(resultHandler.process(result)){
        //$scope.flagged = result.data;
        if(result.data){
          for(var i=0;i<result.data.length;i++){
            $scope.flagged[result.data[i].entityId] = true;
          }
        }
      }
    });
  };

  $scope.getFlagged();

  $scope.isFlagged = function(id){
    if($scope.flagged){
      for(var i=0;i<$scope.flagged.length;i++){
        if($scope.flagged[i].entityId == id){
          return true;
        }
      }
      return false;
    }
    return false;
  };

  $scope.commentQuery = {
    limit: $scope.pageSize //overrides the server side setting
  };

  $scope.applySort = function(sort){
    $scope.commentQuery.sort = sort.field;
    $scope.commentQuery.sortOrder = sort.order;
    $scope.getCommentData($scope.commentQuery);
  };

  $scope.sort = $scope.sortOptions.newest;
  $scope.commentQuery.sort = $scope.sort.field;
  $scope.commentQuery.sortOrder = $scope.sort.order;


  $scope.$on("listItemDeleted", function(event, params){
    for(var i=0;i<$scope.comments.length;i++){
      if($scope.comments[i]._id==params){
        $scope.comments.splice(i,1);
      }
    }
  });


  $scope.getCommentData = function(query, append){
    Comment.get(query, function(result){
      if(resultHandler.process(result, null, true)){
        if(append && append==true){
          $scope.comments = $scope.comments.concat(result.data);
        }
        else{
          $scope.comments = result.data;
        }
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
      entity: $scope.entity,
      content: commentText
    }, function(result){
      if(resultHandler.process(result)){
        $("#summernote").code("");
        //fetch the comments again to resolve any sorting/countnig issues
        $scope.getCommentData($scope.commentQuery);
      }
    })
  };

  $scope.more = function(){
    $scope.commentQuery.skip = $scope.comments.length;
    $scope.getCommentData($scope.commentQuery, true);
  };

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

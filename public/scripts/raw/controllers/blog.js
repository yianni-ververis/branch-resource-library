app.controller("blogController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "searchExchange", "picklistService", function($scope, $resource, $state, $stateParams, userManager, resultHandler, searchExchange, picklistService){
  var Blog = $resource("api/blogs/:blogId", {blogId: "@blogId"});
  $scope.pageSize = 20;
  $scope.query = {};

  var defaultSelection;

  if(!userManager.canApprove('blogs')){
    defaultSelection = {
      field: "approved",
      values: [0],
      lock: true
    }
  }
  $scope.$on("cleared", function(){
    searchExchange.init(defaultSelection);
  })

  searchExchange.clear(true);

  $scope.blogTypes;

  if($stateParams.blogId){
    $scope.query.blogId = $stateParams.blogId;
    $scope.blogId = $stateParams.blogId;
  }

  picklistService.getPicklistItems("Blog Type", function(items){
    $scope.blogTypes = items;
    $scope.newBlogType = items[0];
  });

  $scope.getBlogData = function(query, append){
    Blog.get(query, function(result){
      if(resultHandler.process(result)){
        if(append && append==true){
          $scope.blogs = $scope.blogs.concat(result.data);
        }
        else{
          $scope.blogs = result.data;
          //if this is the detail view we'll update the breadcrumbs
          if($state.current.name == "blogs.detail"){
            $scope.$root.$broadcast('spliceCrumb', {
              text: $scope.blogs[0].title,
              link: "/blogs/"+$scope.blogs[0]._id
            });
          }
        }
        $scope.blogInfo = result;
        delete $scope.blogInfo["data"];
      }
    });
  };

  if($scope.blogId == 'new'){
    $("#blogContent").summernote({
      height: 600
    });
  }
  else{
    $scope.getBlogData($scope.query);
  }

  $scope.previewThumbnail = function(){
    var file = $("#blogImage")[0].files[0];
    var imageName = file.name;
    var imageType = file.type;
    var r = new FileReader();
    r.onloadend = function(event){
      var imageCanvas = document.createElement('canvas');
      var imageContext = imageCanvas.getContext('2d');
      var thumbnail = new Image();
      thumbnail.onload = function() {
        var width = thumbnail.width;
        var height = thumbnail.height;
        imageCanvas.width = width;
        imageCanvas.height = Math.round(width / 4);


        //draw the image and save the blob
        imageContext.drawImage(thumbnail, 0, 0, imageCanvas.width, imageCanvas.height);
        $scope.image = {
          type: imageType,
          name: imageName,
          data: imageCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
        }
        $scope.$apply(function(){
          $scope.newBlogImage = imageCanvas.toDataURL();
        });
      };
      thumbnail.src = r.result;
    }
    r.readAsDataURL(file);
  };

  $scope.validateNewBlogData = function(){
    $scope.saveBlog();
  };

  $scope.saveBlog = function(){
    var data = {
      standard:{
        title: $scope.newBlogTitle,
        content: $("#blogContent").code()
      },
      special:{
        image: $scope.image
      }
    };
    Blog.save({}, data, function(result){

    });
  };

  $scope.getBlogContent = function(text){
    if(text && text.data){
      var buffer = _arrayBufferToBase64(text.data);
      return marked(buffer);
    }
    else{
      return "";
    }
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
}]);

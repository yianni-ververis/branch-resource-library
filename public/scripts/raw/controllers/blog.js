app.controller("blogController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "searchExchange", "notifications", "picklistService", function($scope, $resource, $state, $stateParams, userManager, resultHandler, searchExchange, notifications, picklistService){
  var Blog = $resource("api/blog/:blogId", {blogId: "@blogId"});
  $scope.pageSize = 20;
  $scope.query = {};

  $scope.blogLoading = $stateParams.blogId!="new";

  $scope.dirtyThumbnail = false;

  var defaultSelection;

  if(!userManager.canApprove('blog')){
    defaultSelection = {
      field: "approved",
      values: [0],
      lock: true
    }
  }
  $scope.$on("cleared", function(){
    searchExchange.init(defaultSelection);
  })  

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
      $scope.blogLoading = false;
      if(resultHandler.process(result)){
        if($stateParams.status){
          if($stateParams.status=='created'){
            notifications.notify("Your blog post has been successfully submitted for approval.", null, {sentiment:"positive"});
          }
          else if ($stateParams.status=='updated') {
            notifications.notify("Your blog post has been successfully updated. It may take up to 5 minutes for the listing page to reflect these changes.", null, {sentiment:"positive"});
          }
        }
        if(append && append==true){
          $scope.blogs = $scope.blogs.concat(result.data);
        }
        else{
          $scope.blogs = result.data;
          //if this is the detail view we'll update the breadcrumbs
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
    $scope.dirtyThumbnail = true;
    var file = $("#blogImage")[0].files[0];
    var imageName = file.name;
    var imageType = file.type;
    var r = new FileReader();
    r.onloadend = function(event){
      var imageCanvas = document.createElement('canvas');
      var imageContext = imageCanvas.getContext('2d');
      var thumbnailCanvas = document.createElement('canvas');
      var thumbnailContext = thumbnailCanvas.getContext('2d');
      var thumbnail = new Image();
      thumbnail.onload = function() {
        var width = thumbnail.width;
        var height = thumbnail.height;
        imageCanvas.width = width;
        imageCanvas.height = height;
        thumbnailCanvas.width = (width * (77/height));
        thumbnailCanvas.height = 77;

        //draw the image and save the blob
        imageContext.drawImage(thumbnail, 0, 0, imageCanvas.width, imageCanvas.height);
        $scope.image = {
          type: imageType,
          name: imageName,
          data: imageCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
        }

        //draw the thumbnail and save the blob
        thumbnailContext.drawImage(thumbnail, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
        $scope.thumbnail = {
          type: imageType,
          name: imageName,
          data: thumbnailCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
        }
        $scope.$apply(function(){
          $scope.projects[0].thumbnail = thumbnailCanvas.toDataURL();
        });
      };
      thumbnail.src = r.result;
    }
    r.readAsDataURL(file);
  };

  $scope.validateNewBlogData = function(){
    //We're validating client side so that we don't keep passing image data back and forth
    //Some of these errors shouldnt occur becuase of the html5 'required' attribute but just in case...
    var errors = [];
    //Verify the project has a name
    if(!$scope.blogs[0].title || $scope.blogs[0].title==""){
      errors.push("Please specify a Title");
    }
    //Verify the project has a type
    if(!$scope.blogs[0].blogType){
      errors.push("Please select a Type");
    }
    //Verify the project has content
    if($("#blogContent").code().length==12){  //this is not necessarily robust. a length of 12 appears to be an empty input
      errors.push("Please add some content");
    }
    //If there are errors we need to notify the user
    if(errors.length > 0){
      //show the errors
      notifications.notify("The blog post could not be saved. Please review the following...", errors, {sentiment: "warning"});
      window.scrollTo(100,0);
    }
    else{
      //Save the record
      $scope.saveBlog();
    }
  };

  $scope.saveBlog = function(){
    $scope.blogLoading = true;
    $scope.blogs[0].content = $("#blogContent").code();
    var data = {
      standard: $scope.blogs[0]
    };
    if($scope.dirtyThumbnail){
      data.special = {
        image: $scope.image,
        thumbnail: $scope.thumbnail
      }
    }
    var query = {};
    if($scope.blogs[0]._id){
      query.blogId = $scope.blogs[0]._id;
    }
    Blog.save(query, data, function(result){
      $scope.blogLoading = false;
      if(resultHandler.process(result)){
        var status = $scope.isNew ? "created" : "updated";
        window.location = "#blog/"+result._id+"?status="+status;
      }
      else{
        notifications.notify(result.errText, null, {sentiment: "negative"});
      }
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

  $scope.$on("$stateChangeSuccess", function(){
    //only load the project if we have a valid projectId or we are in list view
    if($state.current.name=="blogs.detail"){
      $scope.getBlogData($scope.query); //get initial data set
      userManager.refresh(function(hasUser){
        $scope.currentuserid = userManager.userInfo._id;
      });
    }
    else if($state.current.name=="blogs.addedit"){
      picklistService.getPicklistItems("Blog Type", function(items){
        $scope.blogTypes = items;
      });
      if($stateParams.blogId=="new"){
        $scope.blogs = [{}];
      }
      var hasUser = userManager.hasUser();
      if(!hasUser){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            window.location = "#login?url=blogs/"+$stateParams.blogId+"/edit"
          }
          else{
            if($stateParams.blogId!="new"){
              $scope.getBlogData($scope.query); //get initial data set
            }
          }
        });
      }
      else{
        if($stateParams.blogId!="new"){
          $scope.getBlogData($scope.query); //get initial data set
        }
      }
    }
    else{ //this should be the list page
      if(!userManager.hasUser()){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            defaultSelection = [{
              field: "approved",
              values: [{qText: "True"}]
            }]
          }
          else{
            if(!userManager.canApprove('blog')){
              defaultSelection = [{
                field: "approved",
                values: [{qText: "True"}]
              }]
            }
          }
          //this effectively initiates the results
          searchExchange.clear(true);
        });
      }
      else{
        if(!userManager.canApprove('blog')){
          defaultSelection = [{
            field: "approved",
            values: [{qText: "True"}]
          }]
        }
        //this effectively initiates the results
        searchExchange.clear(true);
      }
      //$("#newProjectContent").summernote();
      //$scope.projects = [{}]; //add en empty object
    }
  });

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

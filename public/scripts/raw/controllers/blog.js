app.controller("blogController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "picklistService", function($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, picklistService){
  var Blog = $resource("api/blog/:blogId", {blogId: "@blogId"});
  $scope.pageSize = 20;
  $scope.query = {};

  $scope.blogLoading = $stateParams.blogId!="new";

  $scope.isNew = $stateParams.blogId=="new";

  $scope.dirtyThumbnail = false;

  var defaultSelection;

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
        if(result.data && result.data.length > 0){
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
          if($state.current.name=="blogs.addedit"){
            $("#blogContent").code(_arrayBufferToBase64(result.data[0].content.data));
          }
          $scope.blogInfo = result;
          delete $scope.blogInfo["data"];
        }
        else{
          window.location = "#noitem";
        }
      }
    });
  };

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
          $scope.blogs[0].thumbnail = thumbnailCanvas.toDataURL();
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
    //Verify the blog has a name
    if(!$scope.blogs[0].title || $scope.blogs[0].title==""){
      errors.push("Please specify a title");
    }
    if(!$scope.blogs[0].short_description || $scope.blogs[0].short_description==""){
      errors.push("Please specify a short description");
    }
    //Verify the blog has a type
    if(!$scope.blogs[0].blogType){
      errors.push("Please select a Type");
    }
    //Verify the blog has content
    if($("#blogContent").code().length==0 || $("#blogContent").code().length==12){  //this is not necessarily robust. a length of 12 appears to be an empty input
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
    convertToPlainText($scope.blogs[0].content);
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

  $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
    if(fromState.name.split(".")[0]==toState.name.split(".")[0]){ //then we should clear the search state
       if(toState.name.split(".").length==1){ //we only need to do this if we're on a listing page
        searchExchange.publish("executeSearch");
       }
    }
    if(toState.name!="loginsignup"){
      searchExchange.view = toState.name.split(".")[0];
    }
    if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
      searchExchange.clear(true);
    }
    defaultSelection = [];
    if($state.current.name=="blogs.detail"){
      $scope.getBlogData($scope.query); //get initial data set
      userManager.refresh(function(hasUser){
        $scope.currentuserid = userManager.userInfo._id;
      });
    }
    else if($state.current.name=="blogs.addedit"){
      $("#blogContent").summernote({
        height: 400
      });
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
            window.location = "#login?url=blog/"+$stateParams.blogId+"/edit"
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
          searchExchange.subscribe('reset', "blogs", function(){
            searchExchange.init(defaultSelection);
            searchExchange.unsubscribe('reset', "blogs");
          });
          if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
            searchExchange.clear(true);
          }
        });
      }
      else{
        if(!userManager.canApprove('blog')){
          defaultSelection = [{
            field: "approved",
            values: [{qText: "True"}]
          }]
        }
        searchExchange.subscribe('reset', "blogs", function(){
          searchExchange.init(defaultSelection);
          searchExchange.unsubscribe('reset', "blogs");
        });
        if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
          searchExchange.clear(true);
        }
      }
    }
  });

  function convertToPlainText(text){
    console.log(text);
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

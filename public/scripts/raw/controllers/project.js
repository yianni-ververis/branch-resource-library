app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "$anchorScroll", "userManager", "resultHandler", "confirm", "searchExchange", "notifications", function($scope, $resource, $state, $stateParams, $anchorScroll, userManager, resultHandler, confirm, searchExchange, notifications){
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var Picklist = $resource("api/picklists/:picklistId", {picklistId: "@picklistId"});
  var PicklistItem = $resource("api/picklistitems/:picklistitemId", {picklistitemId: "@picklistitemId"});
  var Git = $resource("system/git/:path", {path: "@path"});
  var Rating = $resource("api/ratings");
  var MyRating = $resource("api/ratings/rating/my");

  $scope.$on('searchResults', function(){
    $scope.senseOnline = true;
  });
  var defaultSelection;

  if($state.current.name=="projects.addedit"){
    if(!userManager.hasUser()){
      userManager.refresh(function(hasUser){
        if(!hasUser){
          window.location = "#login?url=projects/new/edit"
        }
      });
    }
  }

  if(!userManager.canApprove('projects')){
    defaultSelection = {
      field: "approved",
      values: [0],
      lock: true
    }
  }
  $scope.$on("cleared", function(){
    searchExchange.init(defaultSelection);
  })

  $scope.pageSize = 20;

  $scope.onlyApproved = !userManager.canApprove('projects');

  $scope.userManager = userManager;
  $scope.Confirm = confirm;

  $scope.projects = [];
  $scope.gitProjects = [];
  $scope.url = "projects";

  $scope.searching = true;

  $scope.rating = {};
  $scope.getRate = {};
  $scope.query = {
    limit: $scope.pageSize
  };

  if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
    $scope.sort = $scope.sortOptions[$stateParams.sort];
  }

  if($stateParams.projectId){
    $scope.query.projectId = $stateParams.projectId;
    $scope.projectId = $stateParams.projectId;
  }

  $scope.ratingClick = function() {
    //$('#rating').css({'color': 'green', 'border':'0 none'})
    if($scope.rate && !$scope.isReadonly) {
      $scope.isReadonly = true;
      $scope.query.votenum = $scope.projects[0].votenum + 1
      $scope.query.votetotal = $scope.projects[0].votetotal + $scope.rate

      $scope.updateProjectData($scope.query)

      $scope.rating.id = $scope.projects[0]._id
      $scope.rating.userid = $stateParams.userId
      $scope.rating.rate = $scope.rate
      $scope.rating.date = new Date()

      var ratingquery = {
        entityId: $scope.rating.id,
        userid: $scope.rating.userid,
        createdate: $scope.rating.date,
        rating: $scope.rating.rate
      }

      $scope.saveRating(ratingquery)
    }
  };

  $scope.getMyRating= function(query) {
    // MyRating.save(query, function(result){
    //   if(resultHandler.process(result)) {
    //     if (result.total > 0 ) {
    //       $scope.isReadonly = true
    //       $scope.rate = result.data[0].rating
    //     } else {
    //       $scope.isReadonly = false
    //     }
    //   }
    // })
  }

  $scope.getPicklistItems = function(picklistName, out){
    Picklist.get({name: picklistName}, function(result){
      if(resultHandler.process(result)){
        if(result.data && result.data[0]){
          PicklistItem.get({picklistId: result.data[0]._id}, function(result){
            if(resultHandler.process(result)){
              $scope[out] = result.data;
            }
          });
        }
      }
    });
  };

  $scope.getPicklistItems("Product", "projectProducts", true);
  $scope.getPicklistItems("Category", "projectCategories", true);
  $scope.getPicklistItems("Project Status", "projectStatuses", true);

  $scope.getProductVersions = function(product){
    $scope.getPicklistItems(product.name + " Version", "productVersions");
  };

  $scope.getProjectData = function(query, append){
    Project.get(query, function(result){
      if(resultHandler.process(result)){
        if(append && append==true){
          $scope.projects = $scope.projects.concat(result.data);
        }
        else{
          $scope.projects = result.data;
          $scope.getRate.userid = $scope.userManager.userInfo._id;
          $scope.getRate.entityId = $scope.projects[0]._id

          $scope.getMyRating($scope.getRate)
          //if this is the detail view we'll update the breadcrumbs
          if($state.current.name == "projects.detail"){
            $scope.$root.$broadcast('spliceCrumb', {
              text: $scope.projects[0].title,
              link: "/projects/"+$scope.projects[0]._id
            });
          }
        }

        $scope.projects.forEach(function(item, index) {
          if (item.votenum > 0) {
            var length = Math.round(item.votetotal/item.votenum)
            $scope.projects[index].stars = new Array(length)
          }
        })

        $scope.projectInfo = result;
        delete $scope.projectInfo["data"];

        $scope.usegit = $scope.projects[0].git_clone_url!=null ? 'true' : 'false';
        $scope.getProductVersions($scope.projects[0].product);

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
    };

  $scope.updateProjectData = function(query) {
    Project.save(query, function(result){
      if(resultHandler.process(result)) {

      }
    })
  }

  $scope.saveRating = function(rating) {
    Rating.save(rating, function(result) {
      if(resultHandler.process(result)) {

      }
    })
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
    if($scope.projects[0] && $scope.projects[0].content){
      return marked($scope.projects[0].content);
      //return $scope.projects[0].content;
    }
  };

  $scope.applySort = function(){
    window.location = "#projects?sort=" + $scope.sort.id + "&product=" + $scope.productId + "&category=" + $scope.categoryId;
  };

  $scope.getGitProjects = function(gituser, gitpassword){
    var creds = {
      user: gituser,
      password: gitpassword
    };
    Git.save({path:"projects"}, creds, function(result){
      if(resultHandler.process(result)){
        $scope.gitProjects = result.repos;
      }
    });
  };

  $scope.selectGitProject = function(project){
    $scope.newProjectGitProject = {
      repo: project.name,
      owner: project.owner.login
    };
  };

  $scope.previewThumbnail = function(){
    var file = $("#thumbnail")[0].files[0];
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
        imageCanvas.width = (width * (600/height));;
        imageCanvas.height = 600;
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
        thumbnailContext.drawImage(thumbnail, 0, 0, thumbnailCanvas.width * (77/thumbnailCanvas.height), 77);
        $scope.thumbnail = {
          type: imageType,
          name: imageName,
          data: thumbnailCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
        }
        $scope.$apply(function(){
          $scope.newProjectThumbnail = thumbnailCanvas.toDataURL();
        });
      };
      thumbnail.src = r.result;
    }
    r.readAsDataURL(file);
  };

  $scope.validateNewProjectData = function(){
    //We're validating client side so that we don't keep passing image data back and forth
    //Some of these errors shouldnt occur becuase of the html5 'required' attribute but just in case...
    var errors = [];
    //Verify the project has a name
    if(!$scope.projects[0].title || $scope.projects[0].title==""){
      //add to validation error list
      errors.push("Please specify a Name");
    }
    //Make sure the product has been set
    if(!$scope.projects[0].product){
      //add to validation error list
      errors.push("Please select a Product");
    }
    //Make sure at least one version has been set
    if($scope.projects[0].product && $(".product-version:checkbox:checked").length==0){
      //add to validation error list
      errors.push("Please specify at least one Product Version");
    }
    //If git is being used make sure a project has been selected
    if($scope.usegit=='true' && !$scope.newProjectGitProject){
      //add to validation error list
      errors.push("Please select a Git project to use");
    }
    //If git is NOT being used make sure some content has been provided
    if($scope.usegit=='false' && !$("#newProjectContent").code()){
      //add to validation error list
      errors.push("Please add some content to the project (e.g. documentation, installation instructions).");
    }
    //If there are errors we need to notify the user
    if(errors.length > 0){
      //show the errors
      notifications.notify("The project could not be saved. Please review the following...", errors, {sentiment: "warning"});
    }
    else{
      //Save the record
      $scope.saveNewProject();
    }
  };

  $scope.saveNewProject = function(){
    var versions = [];
    $(".product-version:checkbox:checked").each(function(val, index){
      versions.push($(this).attr("data-versionid"));
      if(index==$(".product-version:checkbox:checked").length){
        $scope.projects[0].productversions = versions;
      }
    });
    if(!$scope.usegit || $scope.usegit=='false'){
      $scope.projects[0].content = $("#newProjectContent").code();
    }
    var data = {
      standard: $scope.projects[0],  //data that we can just assign to the project
      special:{ //that will be used to set additional properties
        image: $scope.image,
        thumbnail: $scope.thumbnail,
        gitProject: $scope.newProjectGitProject
      }
    }
    Project.save({}, data, function(result){
      if(resultHandler.process(result)){

      }
    });
  };

  $scope.search = function(){
    searchExchange.clear();
    $scope.searching = true;
  };

  $scope.browse = function(){
    searchExchange.clear();
    $scope.searching = false;
  };

  $scope.clear = function(){
    searchExchange.clear();
  };





  //only load the project if we have a valid projectId or we are in list view
  if(($state.current.name=="projects.detail" || $state.current.name=="projects.addedit") && $stateParams.projectId!="new"){
    $scope.getProjectData($scope.query); //get initial data set
  }
  else{ //user needs to be logged in so we redirect to the login page (this is a fail safe as techincally users shouldn't be able to get here without logging in)
    $("#newProjectContent").summernote();
    $scope.usegit = 'true';
    $scope.projects = [{}]; //add en empty object
  }

  function canvasToBlob(canvas, type){
    var byteString = atob(canvas.toDataURL().split(",")[1]),
        ab = new ArrayBuffer(byteString.length),
        ia = new Uint8Array(ab),
        i;

    for (i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {
        type: type
    });
  }

  //this effectively initiates the results
  searchExchange.clear(true);

}]);

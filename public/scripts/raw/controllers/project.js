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

  $scope.$on("cleared", function(){
    searchExchange.init(defaultSelection);
  })

  $scope.pageSize = 20;

  $scope.userManager = userManager;
  $scope.Confirm = confirm;

  $scope.isNew = $stateParams.projectId=="new";

  $scope.projects = [];
  $scope.gitProjects = [];
  $scope.url = "projects";

  $scope.searching = true;

  $scope.projectLoading = !$scope.isNew;
  $scope.gitLoading = false;

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


  $scope.getProductVersions = function(product){
    $scope.getPicklistItems(product.name + " Version", "productVersions");
  };

  $scope.getProjectData = function(query, append){
    Project.get(query, function(result){
      if(resultHandler.process(result)){
        $scope.projectLoading = false;
        if(append && append==true){
          $scope.projects = $scope.projects.concat(result.data);
        }
        else{
          $scope.projects = result.data;

          $scope.getMyRating($scope.getRate)
          //if this is the detail view we'll update the breadcrumbs
          if($state.current.name == "projects.detail"){
            $scope.$root.$broadcast('spliceCrumb', {
              text: $scope.projects[0].title,
              link: "/projects/"+$scope.projects[0]._id
            });
          }
          if($state.current.name == "projects.addedit" && $stateParams.projectId!="new"){
            $scope.$root.$broadcast('spliceCrumb', {
              text: $scope.projects[0].title,
              link: "/projects/"+$scope.projects[0]._id
            });
            $scope.$root.$broadcast('addCrumb', {
              text: "Edit",
              link: "/projects/"+$scope.projects[0]._id+"/edit"
            });
          }
        }
        if($stateParams.status){
          if($stateParams.status=='created'){
            notifications.notify("Your project has been successfully submitted for approval.", null, {sentiment:"positive"});
          }
          else if ($stateParams.status=='updated') {
            notifications.notify("Your project has been successfully updated. It may take up to 5 minutes for the project listing page to reflect these changes.", null, {sentiment:"positive"});
          }
        }
        //need to check this!
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
    $scope.gitLoading = true;
    var creds = {
      user: gituser,
      password: gitpassword
    };
    Git.save({path:"projects"}, creds, function(result){
      if(resultHandler.process(result)){
        $scope.gitLoading = false;
        $scope.gitProjects = result.repos;
      }
    });
  };

  $scope.selectGitProject = function(project){
    $scope.projects[0].project_site = project.html_url;
    $scope.projects[0].git_clone_url = project.clone_url;
    $scope.projects[0].git_repo = project.name;
    $scope.projects[0].git_user = project.owner.login;
  };

  $scope.checkIfVersionChecked = function(version){
    console.log($scope.projects[0].productversions);
    console.log(version);
    console.log($scope.projects[0].productversions.indexOf(version));
    if($scope.projects[0].productversions){
      return $scope.projects[0].productversions.indexOf(version)!=-1;
    }
    else {
      return false;
    }
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
          $scope.projects[0].thumbnail = thumbnailCanvas.toDataURL();
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
    if(!$scope.projects[0].short_description || $scope.projects[0].short_description==""){
      //add to validation error list
      errors.push("Please add a Short Description");
    }
    //Make sure the Project type has been set
    if(!$scope.projects[0].category){
      //add to validation error list
      errors.push("Please select a Project Type");
    }
    //Make sure the Project status has been set
    if(!$scope.projects[0].status){
      //add to validation error list
      errors.push("Please select a Project Status");
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
    if($scope.isNew && !$scope.projects[0].git_repo){
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
      window.scrollTo(100,0);
    }
    else{
      //Save the record
      $scope.saveNewProject();
    }
  };

  $scope.saveNewProject = function(){
    var versions = [];
    $(".product-version:checkbox:checked").each(function(index, val){
      versions.push($(this).attr("data-versionid"));
      if(index==$(".product-version:checkbox:checked").length - 1){
        $scope.projects[0].productversions = versions;
      }
    });
    var data = {
      standard: $scope.projects[0],  //data that we can just assign to the project
      special:{ //that will be used to set additional properties
        image: $scope.image,
        thumbnail: $scope.thumbnail
      }
    }
    var query = {};
    if($scope.projects[0]._id){
      query.projectId = $scope.projects[0]._id;
    }
    Project.save(query, data, function(result){
      if(resultHandler.process(result)){
        var status = $scope.isNew ? "created" : "updated";
        window.location = "#projects/"+result._id+"?status="+status;
      }
      else{
        notifications.notify(result.errText, null, {sentiment: "negative"});
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
  if($state.current.name=="projects.detail"){
    $scope.getProjectData($scope.query); //get initial data set
    userManager.refresh(function(hasUser){
      $scope.currentuserid = userManager.userInfo._id;
    });
  }
  else if($state.current.name=="projects.addedit"){
    $scope.getPicklistItems("Product", "projectProducts", true);
    $scope.getPicklistItems("Category", "projectCategories", true);
    $scope.getPicklistItems("Project Status", "projectStatuses", true);
    var hasUser = userManager.hasUser();
    if(!hasUser){
      userManager.refresh(function(hasUser){
        if(!hasUser){
          window.location = "#login?url=projects/"+$stateParams.projectId+"/edit"
        }
        else{
          if($stateParams.projectId!="new"){
            $scope.getProjectData($scope.query); //get initial data set
          }
        }
      });
    }
    else{
      if($stateParams.projectId!="new"){
        $scope.getProjectData($scope.query); //get initial data set
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
          if(!userManager.canApprove('projects')){
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
      if(!userManager.canApprove('projects')){
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

}]);

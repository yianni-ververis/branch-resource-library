app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "$anchorScroll", "userManager", "resultHandler", "confirm", "searchExchange", function($scope, $resource, $state, $stateParams, $anchorScroll, userManager, resultHandler, confirm, searchExchange){
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var Picklist = $resource("api/picklists/:picklistId", {picklistId: "@picklistId"});
  var PicklistItem = $resource("api/picklistitems/:picklistitemId", {picklistitemId: "@picklistitemId"});
  var Git = $resource("system/git/:path", {path: "@path"});

  $scope.$on('searchResults', function(){
    $scope.senseOnline = true;
  });

  $scope.pageSize = 20;

  $scope.userManager = userManager;
  $scope.Confirm = confirm;

  $scope.projects = [];
  $scope.gitProjects = [];
  $scope.url = "projects";

  $scope.searching = true;

  $scope.stars = new Array(5);

  console.log('params - ',$stateParams);

  $scope.sortOptions = {
    createdate: {
      id: "createdate",
      name: "Last Updated",
      order: -1,
      field: "createdate"
    },
    rating:{
      id: "rating",
      name: "Highest Rated",
      order: [-1,-1],
      field:["votenum", "votetotal"]
    },
    lastpost: {
      id: "lastpost",
      name: "Most recent comments",
      order: -1,
      field: "lastpost"
    },
    title: {
      id: "title",
      name: "A-Z",
      order: 1,
      field: "title"
    }
  };

  $scope.sort = $scope.sortOptions.createdate;
  $scope.categoryId = "";
  $scope.productId = "";

  $scope.query = {
    limit: $scope.pageSize
  };

  if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
    $scope.sort = $scope.sortOptions[$stateParams.sort];
  }
  $scope.query.sort = $scope.sort.field;
  $scope.query.sortOrder = $scope.sort.order;
  if($stateParams.projectId){
    $scope.query.projectId = $stateParams.projectId;
    $scope.projectId = $stateParams.projectId;
  }
  if($stateParams.product){
    $scope.productId = $stateParams.product;
    $scope.query.product = $stateParams.product;
  }
  if($stateParams.category){
    $scope.categoryId = $stateParams.category;
    $scope.query.category = $stateParams.category;
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
          //if this is the detail view we'll update the breadcrumbs
          if($state.current.name == "projects.detail"){
            $scope.$root.$broadcast('spliceCrumb', {
              text: $scope.projects[0].title,
              link: "/projects/"+$scope.projects[0]._id
            });
          }
        }
        $scope.projectInfo = result;
        delete $scope.projectInfo["data"];
        console.log($scope.projectInfo);
      }
    });
  };

  $scope.getMore = function(){
    var query = $scope.projectInfo.query;
    query.limit = $scope.projectInfo.limit;
    query.skip = $scope.projectInfo.skip;
    query.sort = $scope.sort.field;
    query.sortOrder = $scope.sort.order;
    $scope.getProjectData(query, true);
  };

  $scope.getRating = function(total, count){
    if(count && count > 0){
      return Math.round(parseInt(total) / parseInt(count));
    }
    else{
      return 0;
    }
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

  $scope.flagProject = function(project){
    Project.save({projectId:project._id, function: "flag"}, function(result){
      if(resultHandler.process(result)){
        project.flagged = true;
      }
    });
  };

  $scope.hideProject = function(project){
    Project.save({projectId:project._id, function: "hide"}, function(result){
      if(resultHandler.process(result)){
        project.approved = false;
      }
    });
  };

  $scope.approveProject = function(project){
    Project.save({projectId:project._id, function: "approve"}, function(result){
      if(resultHandler.process(result)){
        project.approved = true;
        project.flagged = false;
      }
    });
  };

  $scope.deleteProject = function(project, index){
    $scope.Confirm.prompt("Are you sure you want to delete the project "+project.title, ["Yes", "No"], function(result){
      if(result==0){
        if($stateParams.projectId){
          window.location = "#projects";
        }
        else {
          Project.delete({projectId: project._id}, function(result){
              if(resultHandler.process(result)){
                $scope.projects.splice(index, 1);
              }
          });
        }
      }
    });
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
    console.log(project);
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
    var errors = [];
    //Verify the project has a name
    if(!$scope.newProjectName || $scope.newProjectName==""){
      //add to validation error list
      errors.push({});
    }
    //Make sure the product has been set
    if(!$scope.newProjectProduct){
      //add to validation error list
      errors.push({});
    }
    //Make sure at least one version has been set
    if($scope.newProjectProduct && $(".product-version").length==0){
      //add to validation error list
      errors.push({});
    }
    //If git is being used make sure a project has been selected
    if($scope.usegit=='true' && !$scope.newProjectGitProject){
      //add to validation error list
      errors.push({});
    }
    //If git is NOT being used make sure some content has been provided
    if($scope.usegit=='false' && !$("#newProjectContent").code()){
      //add to validation error list
      errors.push({});
    }
    //If there are errors we need to notify the user
    if(errors.length > 0){
      //show the errors
    }
    else{
      //Save the record
      $scope.saveNewProject();
    }
  };

  $scope.saveNewProject = function(){
    var data = {
      standard:{  //data that we can just assign to the project
        title: $scope.newProjectName,
        short_description: $scope.newProjectDescription,
        product: $scope.newProjectProduct,
        category: $scope.newProjectCategory
      },
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


  searchExchange.clear();


  //only load the project if we have a valid projectId or we are in list view
  if(($state.current.name=="projects.detail" && $stateParams.projectId!="new") || $state.current.name=="projects"){
    $scope.getProjectData($scope.query); //get initial data set
  }
  else{ //user needs to be logged in so we redirect to the login page (this is a fail safe as techincally users shouldn't be able to get here without logging in)
    $("#newProjectContent").summernote();
    $scope.usegit = 'true';
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

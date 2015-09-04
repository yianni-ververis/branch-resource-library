app.controller("adminController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "searchExchange", function($scope, $resource, $state, $stateParams, userManager, resultHandler, searchExchange){
  var User = $resource("api/users/:userId", {userId: "@userId"});
  var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
  var Article = $resource("api/articles/:articleId", {articleId: "@articleId"});
  var UserRoles = $resource("api/userroles/:roleId", {roleId: "@roleId"});
  var Feature = $resource("api/features/:featureId", {featureId: "@featureId"});
  var Picklist = $resource("api/picklists/:picklistId", {picklistId: "@picklistId"});
  var PicklistItem = $resource("api/picklistitems/:picklistitemId", {picklistitemId: "@picklistitemId"});

  $scope.userManager = userManager;

  $scope.collections = [
    "users",
    "userroles",
    "features",
    "projects",
    "comments",
    "blogs",
    "picklists",
    "picklistitems"
  ];

  $scope.pageSize = 20;

  User.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.users = result.data;
      $scope.userInfo = result;
      delete $scope.userInfo["data"];
    }
  });

  UserRoles.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.roles = result.data;
      $scope.roleInfo = result;
      delete $scope.roleInfo["data"];
      $scope.setRole(0);
    }
  });

  Feature.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.features = result.data;
      $scope.featureInfo = result;
      delete $scope.featureInfo["data"];
      $scope.setActiveFeature(0);
    }
  });

  Picklist.get({}, function(result){
    if(resultHandler.process(result)){
      $scope.picklists = result.data;
      $scope.picklistInfo = result;
      delete $scope.picklistInfo["data"];
      $scope.setActivePickList(0);
    }
  });

  $scope.activeRole = 0;

  $scope.activePicklist = 0;

  $scope.activeTab = 0;

  $scope.activeFeature = 0;

  $scope.setTab = function(index){
    $scope.activeTab = index;
    searchExchange.clear();
    if(index==2){
      //if the feature entities haven't been loaded get the first page of data
      //PROJECTS
      if(!$scope.projects || $scope.projects.length==0){
        Project.get({}, function(result){
          if(resultHandler.process(result)){
            $scope.projects = result.data;
            $scope.projectInfo = result;
            delete $scope.projectInfo["data"];
          }
        })
      }
      //ARTICLES
      if(!$scope.articles || $scope.articles.length==0){
        Article.get({}, function(result){
          if(resultHandler.process(result)){
            $scope.articles = result.data;
            $scope.articleInfo = result;
            delete $scope.articleInfo["data"];
          }
        })
      }
    }
  };

  $scope.setRole = function(index){
    $scope.activeRole = index;
    $scope.copyRoleName = $scope.roles[$scope.activeRole].name;
  };

  $scope.setActivePickList = function(index){
    $scope.activePicklist = index;
    $scope.getPicklistItems($scope.picklists[index]._id);
    $scope.copyListName = $scope.picklists[$scope.activePicklist].name;
  };

  $scope.setActiveFeature = function(index){
    $scope.activeFeature = index;
  };

  $scope.saveRole = function(){
    console.log($scope.roles[$scope.activeRole]);
    UserRoles.save({roleId:$scope.roles[$scope.activeRole]._id}, $scope.roles[$scope.activeRole], function(result){
      if(resultHandler.process(result, "Save")){
        $scope.userManager.refresh();
      }
    });
  };

  $scope.savePicklist = function(){
    console.log($scope.picklists[$scope.activePicklist]);
    Picklists.save({picklistId:$scope.picklists[$scope.activePicklist]._id}, $scope.picklists[$scope.activePicklist], function(result){
      if(resultHandler.process(result, "Save")){

      }
    });
  };

  $scope.newRole = function(newrolename){
    var that = this;
    UserRoles.save({}, {name: newrolename}, function(result){
      if(resultHandler.process(result, "Create")){
        $scope.roles.push(result);
        that.newrolename = "";
        $scope.setRole($scope.roles.length -1);
      }
    });
  };

  $scope.newPicklist = function(newlistname){
    var that = this;
    Picklist.save({}, {name: newlistname}, function(result){
      if(resultHandler.process(result, "Create")){
        $scope.picklists.push(result);
        that.newlistname = "";
        $scope.setActivePickList($scope.picklists.length -1);
      }
    });
  };

  $scope.newPicklistItem = function(newlistitem){
    var that = this;
    var item = {
      name: newlistitem,
      picklistId: $scope.picklists[$scope.activePicklist]._id
    };
    that.newlistitem = "";
    $scope.savePicklistItem(item);
  };

  $scope.getPicklistItems = function(picklistId){
    PicklistItem.get({picklistId: picklistId}, function(result){
      if(resultHandler.process(result)){
        $scope.picklistItems = result.data;
      }
    });
  };

  $scope.savePicklistItem = function(item){
    PicklistItem.save({picklistitemId: item._id || ""}, item, function(result){
      if(resultHandler.process(result, "Save")){
        if($scope.picklistItems){
          $scope.picklistItems.push(result);
        }
        else{
          $scope.picklistItems = [result];
        }
      }
    });
  };

  $scope.copyRole = function(copyrolename){
    var roleToCopy = $scope.roles[$scope.activeRole];
    if(copyrolename==roleToCopy.name){
      copyrolename += " - copy";
    }
    UserRoles.save({}, {name: copyrolename, permissions: roleToCopy.permissions}, function(result){
      if(resultHandler.process(result, "Copy")){
        $scope.roles.push(result);
        $scope.setRole($scope.roles.length -1);
      }
    });
  };

  $scope.setFeature = function(id){
    if($scope.features[$scope.activeFeature].name=="project"){
      Feature.save({featureId: $scope.features[$scope.activeFeature]._id }, {entityId: id}, function(result){
        resultHandler.process(result);
      });
    }
  };

  $scope.saveFeature = function(){
    Feature.save({featureId: $scope.features[$scope.activeFeature]._id }, $scope.features[$scope.activeFeature], function(result){
      resultHandler.process(result);
    });
  };

  $scope.highlightRow = function(id){
    if($scope.features[$scope.activeFeature].entityId==id){
      return true;
    }
    return false;
  }
}]);

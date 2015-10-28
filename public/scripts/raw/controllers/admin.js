app.controller("adminController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "searchExchange", "confirm", function($scope, $resource, $state, $stateParams, userManager, resultHandler, searchExchange, confirm){
  var User = $resource("api/user/:userId", {userId: "@userId"});
  var Project = $resource("api/project/:projectId", {projectId: "@projectId"});
  var Article = $resource("api/article/:articleId", {articleId: "@articleId"});
  var UserRoles = $resource("api/userrole/:roleId", {roleId: "@roleId"});
  var Feature = $resource("api/feature/:featureId", {featureId: "@featureId"});
  var Picklist = $resource("api/picklist/:picklistId", {picklistId: "@picklistId"});
  var PicklistItem = $resource("api/picklistitem/:picklistitemId", {picklistitemId: "@picklistitemId"});

  $scope.userManager = userManager;

  $scope.doingStuff = false;

  $scope.collections = [
    "user",
    "userrole",
    "feature",
    "project",
    "comment",
    "blog",
    "picklist",
    "picklistitem",
    "flag",
    "rating",
    "subscription"
  ];

  var defaultSelection;

  $scope.$on("cleared", function(){
    searchExchange.init(defaultSelection);
  })

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
    Feature.get({_id: $scope.features[$scope.activeFeature]._id}, function(result){
      if(resultHandler.process(result)){
        if(result.data && result.data.length > 0){
          $scope.currentFeature = result.data[0];
        }
      }
    });
  };

  $scope.saveRole = function(){
    UserRoles.save({roleId:$scope.roles[$scope.activeRole]._id}, $scope.roles[$scope.activeRole], function(result){
      if(resultHandler.process(result, "Save")){
        $scope.userManager.refresh();
      }
    });
  };

  $scope.savePicklist = function(){
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
      if(resultHandler.process(result)){
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
      picklistId: $scope.picklists[$scope.activePicklist]._id,
      seq: $scope.picklistItems.length
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
      if(resultHandler.process(result)){
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
      if(resultHandler.process(result)){
        $scope.roles.push(result);
        $scope.setRole($scope.roles.length -1);
      }
    });
  };

  $scope.$on('setFeature', function(event, args){
    $scope.setFeature(args[0]);
  });

  $scope.changeFeatureImage = function(){
    confirm.prompt("Would you like to upload an image or enter a url to link to?", {options:["Upload", "Link", "Cancel"]}, function(response){
      if(response.result==0){
        //upload
      }
      else if(response.result==1){
        //link
        confirm.prompt("Please enter a link to an image", {requireComment: true, options:["Ok","Cancel"]}, function(response){
          if(response.result==0){
            $scope.currentFeature.image = response.comment;
            $scope.saveFeature();
          }
        });
      }
    });
  };

  $scope.setFeature = function(entity){
    //$scope.features[$scope.activeFeature].entityId = entity.id;
    $scope.currentFeature.entityId = entity.id;
    $scope.currentFeature.title = entity.data.title;
    $scope.currentFeature.comment = entity.data.short_description || entity.data.content;
    $scope.currentFeature.image = entity.data.image=="-"? entity.data.thumbnail : entity.data.image;
    $scope.currentFeature.userid = entity.data.user;
    Feature.save({featureId: $scope.features[$scope.activeFeature]._id }, $scope.currentFeature, function(result){
      if(resultHandler.process(result)){
        $scope.setActiveFeature($scope.activeFeature);
      }
    });
  };

  $scope.saveFeature = function(){
    Feature.save({featureId: $scope.features[$scope.activeFeature]._id }, $scope.currentFeature, $scope.features[$scope.activeFeature], function(result){
      if(resultHandler.process(result)){
        $scope.setActiveFeature($scope.activeFeature);
      }
    });
  };

  $scope.highlightRow = function(id){
    if($scope.features[$scope.activeFeature].entityId==id){
      return true;
    }
    return false;
  };

  $scope.deletePicklistItem = function(id){
    $scope.doingStuff = true;
    PicklistItem.delete({picklistitemId: id}, function(result){
      $scope.doingStuff = false;
      if(resultHandler.process(result)){
          $scope.setActivePickList($scope.activePicklist);
      }
    });
  };

  $scope.movePicklistItem = function(index, direction){
    var stepA = $scope.picklistItems[index];
    var stepB = $scope.picklistItems[index + direction];
    originalA = stepA.seq || index;
    originalB = stepA.seq || (index + direction);
    if(!stepA.seq){
      stepA.seq = originalA;
    }
    if(!stepB.seq){
      stepB.seq = originalB;
    }
    stepA.seq += direction;
    stepB.seq -= direction;
    PicklistItem.save({picklistitemId: stepA._id}, stepA, function(result){
      if(resultHandler.process(result)){
        PicklistItem.save({picklistitemId: stepB._id}, stepB, function(result){
          if(resultHandler.process(result)){
            $scope.picklistItems.splice(originalA, 1);
            $scope.picklistItems.splice(originalA+=direction, 0, stepA);
          }
        });
      }
    });
  };
}]);

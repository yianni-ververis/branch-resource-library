app.controller("moderationController", ["$scope", "$rootScope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function($scope, $rootScope, $resource, $state, $stateParams, userManager, resultHandler, confirm, title){
  var Entity = $resource("/api/"+$scope.entity+"/:entityId/:function", {entityId: "@entityId", function: "@function"});
  var GitReadme = $resource("/git/updatereadme/:projectId", {projectId: "@projectId"});  //currently only applies to projects

  $scope.userManager = userManager;

  $scope.isApproved = function(){
    return $scope.approved == "True" || $scope.approved == true;
  };

  $scope.flagEntity = function(flagType){
    confirm.prompt("Please provide a comment for this action.", {requireComment: true, options:["Ok", "Cancel"]}, function(response){
      var fn = $scope.flagged==true ? "unflag" : "flag";
      if(response.result==0){
        Entity.save({entityId: $scope.entityid, function: fn}, {comment: response.comment, flagType: flagType}, function(result){
          if(resultHandler.process(result)){
            $scope.flagged = !$scope.flagged;
          }
        });
      }
    });
  };

  $scope.hideEntity = function(){
    confirm.prompt("Please enter a reason for unapproving the item. An email will be sent to the owner so try not to be too harsh.", {requireComment: true, options:["Send", "Cancel"]}, function(response){
      if(response.result==0){
        Entity.save({entityId: $scope.entityid, function: "hide", hideComment: response.comment}, function(result){
          if(resultHandler.process(result)){
            $scope.approved = "False";
          }
        });
      }
    });
  };

  $scope.approveEntity = function(){
    Entity.save({entityId: $scope.entityid, function: "approve"}, function(result){
      if(resultHandler.process(result)){
        $scope.approved = "True";
        //need to remove all flags for the project here
      }
    });
  };

  $scope.editEntity = function(){
    window.location = "#!"+$scope.entity+"/"+$scope.entityid+"/edit";
  };

  $scope.updateReadme = function(){
    GitReadme.get({projectId: $scope.entityid}, function(result){
      if(resultHandler.process(result)){
        window.location.reload();
      }
    })
  };

  $scope.deleteEntity = function(){
    confirm.prompt("Are you sure you want to delete the selected item?", {options:["Yes", "No"]}, function(response){
      if(response.result==0){
        Entity.delete({entityId: $scope.entityid}, function(result){
            if(resultHandler.process(result)){
              if($scope.entity!="comment"){
                window.location = "#!"+$scope.entity;
              }
              $rootScope.$broadcast("listItemDeleted", $scope.entityid);
            }
        });
      }
    });
  };

  if(!userManager.hasUser()){
    userManager.refresh(function(hasUser){
      if(!hasUser){
        $scope.hasUser = false;
      }
      else{
        $scope.hasUser = true;
      }
    })
  }
  else{
    $scope.hasUser = true;
  }
}]);

app.controller("moderationController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function($scope, $resource, $state, $stateParams, userManager, resultHandler, confirm, title){
  var Entity = $resource("/api/"+$scope.entity+"/:entityId/:function", {entityId: "@entityId", function: "@function"});

  $scope.userManager = userManager;

  $scope.isApproved = function(){
    return $scope.approved == "True" || $scope.approved == true;
  };

  $scope.flagEntity = function(){
    //Need to implement new flagging functionality
    var fn = $scope.flagged==true ? "unflag" : "flag";
    Entity.save({entityId: $scope.entityid, function: fn}, function(result){
      if(resultHandler.process(result)){
        $scope.flagged = !$scope.flagged;
      }
    });
  };

  $scope.hideEntity = function(){
    Entity.save({entityId: $scope.entityid, function: "hide"}, function(result){
      if(resultHandler.process(result)){
        $scope.approved = "False";
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
    window.location = "#"+$scope.entity+"/"+$scope.entityid+"/edit";
  };

  $scope.deleteEntity = function(){
    confirm.prompt("Are you sure you want to delete the selected item", ["Yes", "No"], function(result){
      if(result==0){
        Entity.delete({entityId: $scope.entityid}, function(result){
            if(resultHandler.process(result)){
              window.location = "#"+$scope.entity;
            }
        });
      }
    });
  };
}]);

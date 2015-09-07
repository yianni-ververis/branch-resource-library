app.controller("moderationController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function($scope, $resource, $state, $stateParams, userManager, resultHandler, confirm, title){
  var Entity = $resource("/api/"+$scope.entity+"/:entityId/:function", {entityId: "@entityId", function: "@function"});

  $scope.userManager = userManager;

  $scope.flagEntity = function(){
    //Need to implement new flagging functionality
    Entity.save({entityId: $scope.entityid, function: "flag"}, function(result){
      if(resultHandler.process(result)){

      }
    });
  };

  $scope.hideEntity = function(){
    Entity.save({entityId: $scope.entityid, function: "hide"}, function(result){
      if(resultHandler.process(result)){

      }
    });
  };

  $scope.approveEntity = function(){
    Entity.save({entityId: $scope.entityid, function: "approve"}, function(result){
      if(resultHandler.process(result)){

        //need to remove all flags for the project here
      }
    });
  };

  $scope.deleteEntity = function(){
    $scope.Confirm.prompt("Are you sure you want to delete the selected item", ["Yes", "No"], function(result){
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

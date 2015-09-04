app.controller("senseController", ["$scope", "$resource", "$state", "$stateParams", function($scope, $resource, $state, $stateParams){
  var config = {
    host: "52.11.126.107/peportal",
    isSecure: false
  };

  var senseApp;

  qsocks.Connect(config).then(function(global){
    global.openDoc("0911af14-71f8-4ba7-8bf9-be2f847dc292").then(function(app){
      senseApp = app;
      $scope.$broadcast("ready", app);
    }, function(error) {
        if (error.code == "1002") { //app already opened on server
            global.getActiveDoc().then(function(app){
              senseApp = app;
              $scope.$broadcast("senseready", app);
            });
        } else {
            console.log(error)
        }
    });
  });

}]);

app.directive('header', ['userManager', function (userManager) {
  return {
    restrict: "A",
    replace: true,
    scope:{

    },
    templateUrl: "/views/header.html",
    link: function(scope){
      scope.userManager = userManager;      
    }
  }
}]);

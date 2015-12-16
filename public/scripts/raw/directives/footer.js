app.directive('footer', ['userManager', '$state', '$interpolate', function (userManager, $state, $interpolate) {
  return {
    restrict: "A",
    replace: true,
    scope:{

    },
    templateUrl: "/views/footer.html",
    controller: ['$scope', function($scope){
      $scope.userManager = userManager;
      $scope.breadcrumb;

      $scope.$on("$stateChangeStart", function(){
        $scope.breadcrumb = null;
      });
    }]
  }
}]);

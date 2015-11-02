app.directive('header', ['userManager', '$state', '$interpolate', function (userManager, $state, $interpolate) {
  return {
    restrict: "A",
    replace: true,
    scope:{

    },
    templateUrl: "/views/header.html",
    link: function(scope){
      scope.userManager = userManager;
      scope.getLoginUrl = function(){
        var suffix = "";

        if($state.$current.name!="home"){
          suffix += "?url=";
        }
        if(window.location.hash.indexOf('login')==-1 && window.location.hash.indexOf('reset')==-1){
          suffix += window.location.hash.replace("#/","");
        }
        return "#loginsignup"+suffix;
      }
    }
  }
}]);

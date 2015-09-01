app.directive('searchInput', ['searchExchange', '$state', '$interpolate', function (searchExchange, $state, $interpolate) {
  return {
    restrict: "E",
    replace: true,
    scope:{

    },
    templateUrl: "/views/search/search-input.html",
    link: function(scope){
      var ignoreKeys = [
        16
      ];
      var reservedKeys = [ //these keys should not execute another search, they are reserved for the suggestions mechanism
        9,
        13,
        38,
        40,
        39,
        37,
        32
      ];
      scope.$on('senseready', function(params){
        console.log('sense is ready');
      });

      scope.$on('searchResults', function(results){
        console.log(results);
      });

      scope.keyDown = function(event){


      };

      scope.keyUp = function(event){
        if(ignoreKeys.indexOf(event.keyCode) != -1){
          return;
        }
        if(reservedKeys.indexOf(event.keyCode) == -1){
          if(scope.searchText.length > 0){
            scope.preSearch();
          }
          else{
            //clear the search
          }
        }
      };

      scope.preSearch = function(){
        searchExchange.search(scope.searchText);
      }
    }
  }
}]);

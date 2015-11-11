app.directive("searchFilter", [function(){
  return {
    restrict: "E",
    replace: true,
    scope: {

    },
    link: function($scope, element, attr){
      $scope.title = attr.title;
      $scope.handle;
      $scope.items;

      $scope.toggleValue =  function(elemNum){
        $scope.$parent.toggleSelect(attr.field, elemNum);
      }
      $scope.$on('searchResults', function(){
        if($scope.handle){
          $scope.render();
        }
        else{
          $scope.postponed = function(){
            $scope.render();
          }
        }
      });

      $scope.$on('initialising', function(){
        $scope.loading = true;
      });

      $scope.$on('initialised', function(){
        if($scope.handle){
          $scope.render();
        }
        else{
          $scope.postponed = function(){
            $scope.render();
          }
        }
      });

      searchExchange.subscribe("update", $(element).attr("id"), function(params){
        setTimeout(function(){
          if($scope.handle){
            $scope.render();
          }
          else{
            $scope.postponed = function(){
              $scope.render();
            }
          }
        },0);
      });
      $scope.$on('cleared', function(){
        if($scope.handle){
          $scope.render();
        }
        else{
          $scope.postponed = function(){
            $scope.render();
          }
        }
      });

      $scope.render = function(){
        searchExchange.ask($scope.handle, "GetLayout", [], function(response){
          var layout = response.result.qLayout;
          searchExchange.ask($scope.handle, "GetListObjectData", ["/qListObjectDef",[{qTop:0, qLeft:0, qHeight:layout.qListObject.qSize.qcy, qWidth: 1 }]], function(response){
            var data = response.result.qDataPages;
            $scope.items = data[0].qMatrix;
            $scope.$apply();
          });
        });
      };

      $scope.selectValue = function(value){
        searchExchange.ask($scope.handle, "SelectListObjectValues", ["/qListObjectDef", [value], true], function(response){
        //$scope.info.object.selectListObjectValues("/qListObjectDef", [value], true).then(function(){
          searchExchange.render();
        });
      };

      searchExchange.addFilter({
          id: $(element).attr("id"),
          field: attr.field
        }, function(result){
        //$scope.$apply(function(){
          $scope.handle = result.handle;
          if($scope.postponed){
            $scope.postponed.call(null);
          }
          //$scope.$apply();
          // else{
          //   $scope.render();
          // }

        //});
      });

    },
    templateUrl: "/views/search/search-filter.html"
  }
}])

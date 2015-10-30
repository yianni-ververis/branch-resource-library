app.directive("searchFilter", ["searchExchange", function(searchExchange){
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
        if($scope.info){
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
        if($scope.info){
          $scope.render();
        }
        else{
          $scope.postponed = function(){
            $scope.render();
          }
        }
      });

      $scope.$on("update", function(params){
        if($scope.handle){
          $scope.render();
        }
        else{
          $scope.postponed = function(){
            $scope.render();
          }
        }
      });
      $scope.$on('cleared', function(){
        if($scope.info){
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
          var layout = response.qLayout;
          searchExchange.ask($scope.handle, "GetListObjectData", ["/qListObjectDef",[{qTop:0, qLeft:0, qHeight:layout.qListObject.qSize.qcy, qWidth: 1 }]], function(response){
            var data = response.qDataPages;
            $scope.$apply(function(){
              $scope.items = data[0].qMatrix;
            });
          });
        });
        // $scope.info.object.getLayout().then(function(layout){
        //   $scope.info.object.getListObjectData("/qListObjectDef", [{qTop:0, qLeft:0, qHeight:layout.qListObject.qSize.qcy, qWidth: 1 }]).then(function(data){
        //     $scope.$apply(function(){
        //       $scope.info.items = data[0].qMatrix;
        //     });
        //   });
        // });
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

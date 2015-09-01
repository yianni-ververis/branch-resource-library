app.directive("searchFilter", ["searchExchange", function(searchExchange){
  return {
    restrict: "E",
    replace: true,
    scope: {

    },
    link: function($scope, element, attr){
      $scope.title = attr.title;
      searchExchange.addFilter(attr.field, attr.title, function(result){
        $scope.$apply(function(){
          $scope.info = result;
          $scope.render();
        });
      });
      $scope.toggleValue =  function(elemNum){
        $scope.$parent.toggleSelect(attr.field, elemNum);
      }
      $scope.$on('searchResults', function(){
        $scope.render();
      });

      $scope.render = function(){
        $scope.info.object.getLayout().then(function(layout){
          $scope.info.object.getListObjectData("/qListObjectDef", [{qTop:0, qLeft:0, qHeight:layout.qListObject.qSize.qcy, qWidth: 1 }]).then(function(data){
            $scope.$apply(function(){
              console.log(data[0].qMatrix);
              $scope.info.items = data[0].qMatrix;
            });
          });
        });
      }
    },
    templateUrl: "/views/search/search-filter.html"
  }
}])

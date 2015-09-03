app.directive("searchResults", ["searchExchange", function(searchExchange){
  return {
    restrict: "E",
    replace: true,
    scope: {
      pagesize: "="
    },
    link: function($scope, element, attr){
      $.ajax({type: "GET", dataType: "text", contentType: "application/json", url: '/configs/'+attr.config+'.json', success: function(json){
        $scope.config = JSON.parse(json);
        $scope.template = $scope.config.template;
        $scope.fields = $scope.config.fields;
        $scope.sortOptions = $scope.config.sorting;
        $scope.sort = $scope.sortOptions[$scope.config.defaultSort];

        $scope.items = [];
        $scope.$on('searchResults', function(){
          $scope.render();
        });
        $scope.$on("update", function(params){
          $scope.render();
        });
        $scope.$on('cleared', function(){
          $scope.render();
        });

        $scope.render = function(){
          $scope.info.object.getLayout().then(function(layout){
            //$scope.info.object.getHyperCubeData("/qHyperCubeDef", [{qTop:0, qLeft:0, qHeight: $scope.pagesize, qWidth: $scope.fields.length }]).then(function(data){
            $scope.$apply(function(){
              $scope.items = layout.qHyperCube.qDataPages[0].qMatrix.map(function(row){
                var item = {}
                for (var i=0; i < row.length; i++){
                  item[layout.qHyperCube.qDimensionInfo[i].qFallbackTitle] = row[i].qText;
                }
                return item;
              });
            });
          //});
          });
        };

        searchExchange.addResults($scope.fields, $scope.pagesize, $scope.sort, function(result){
          $scope.$apply(function(){
            $scope.info = result;
            $scope.render();
          });
        });

      }});
    },
    templateUrl: "/views/search/search-results.html"
  }
}])

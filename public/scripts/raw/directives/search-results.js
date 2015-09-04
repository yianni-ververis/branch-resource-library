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

        $scope.pageTop = 0;
        $scope.pageBottom = $scope.pagesize;
        $scope.currentPage = 1;
        $scope.pages = [];

        $scope.$on('searchResults', function(){
          $scope.render();
        });
        $scope.$on("update", function(params){
          $scope.render();
        });
        $scope.$on('cleared', function(){
          $scope.render();
        });

        $scope.changePage = function(direction){
          $scope.pageTop += ($scope.pagesize * direction);
          $scope.render();
        };

        $scope.setPage = function(pageNumber){
          $scope.pageTop = ($scope.pagesize * pageNumber);
          $scope.render();
        }

        $scope.pageInRange = function(pageIndex){
					var minPage, maxPage;
					if($scope.pages.length==1){
						return false;
					}
					else if($scope.currentPage <= 2){
						minPage = 1;
						maxPage = 5
					}
					else if ($scope.currentPage >= $scope.pages.length - 2) {
						minPage = $scope.pages.length - 5;
						maxPage = $scope.pages.length;
					}
					else{
						minPage = $scope.currentPage - 2;
						maxPage = $scope.currentPage + 2;
					}
					return (pageIndex >= minPage && pageIndex <= maxPage);
				};

        $scope.render = function(){
          $scope.info.object.getLayout().then(function(layout){
            $scope.info.object.getHyperCubeData("/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:0, qHeight: $scope.pagesize, qWidth: $scope.fields.length }]).then(function(data){
              $scope.$apply(function(){
                $scope.pageTop = data[0].qArea.qTop;
                $scope.pageBottom = (data[0].qArea.qTop + data[0].qArea.qHeight);
                $scope.currentPage = Math.floor($scope.pageBottom / $scope.pagesize);
                $scope.total = layout.qHyperCube.qSize.qcy;
                $scope.pages = [];
                for(var i=1;i<(Math.ceil($scope.total/$scope.pagesize)+1);i++){
                  $scope.pages.push(i);
                }
                $scope.items = data[0].qMatrix.map(function(row){
                  var item = {}
                  for (var i=0; i < row.length; i++){
                    item[layout.qHyperCube.qDimensionInfo[i].qFallbackTitle] = row[i].qText;
                  }
                  return item;
                });
              });
            });
          });
        };

        $scope.applySort = function(){
          $scope.info.object.applyPatches([{
            qPath: "/qHyperCubeDef/qInterColumnSortOrder",
            qOp: "replace",
            qValue: getFieldIndex($scope.sort.field)
          }], true).then(function(result){
            $scope.render();
          });
        };

        function getFieldIndex(field, asString){
          for (var i=0;i<$scope.fields.length;i++){
            if($scope.fields[i].name==field){
              if(asString!=undefined && asString==false){
                return [i];
              }
              else {
                return "["+i+"]";
              }
            }
          }
          return 0;
        }

        searchExchange.addResults($scope.fields, $scope.pagesize, $scope.sortOptions, getFieldIndex($scope.sort.field, false), function(result){
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

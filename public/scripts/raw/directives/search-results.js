app.directive("searchResults", ["$resource", "searchExchange", "userManager", "resultHandler", function($resource, searchExchange, userManager, resultHandler){
  return {
    restrict: "E",
    replace: true,
    scope: {

    },
    link: function($scope, element, attr){
      $.ajax({type: "GET", dataType: "text", contentType: "application/json", url: '/configs/'+attr.config+'.json', success: function(json){
        $scope.config = JSON.parse(json);
        $scope.template = $scope.config.template;
        $scope.fields = $scope.config.fields;
        $scope.qFields;
        $scope.sortOptions = $scope.config.sorting;
        $scope.sort = $scope.sortOptions[$scope.config.defaultSort];
        var Entity = $resource("/api/" + $scope.config.entity + "/:id", {id: "@id"});

        //add additional sorting for moderators and admins
        if(userManager.canApprove($scope.config.entity)){
          $scope.sortOptions["flagged"] = {
            "id": "flagged",
            "name": "Flagged",
            "order": -1,
            "field": "flagcount",
            "sortType": "qSortByNumeric"
          };
        }

        $scope.loading = true;

        $scope.items = [];

        $scope.hidden = [];

        $scope.flagged = {};

        $scope.stars = new Array(5);

        $scope.postponed;

        $scope.pageTop = 0;
        $scope.pageBottom = $scope.config.pagesize;
        $scope.currentPage = 1;
        $scope.pages = [];

        $scope.broadcast = function(fnName, params){
          $scope.$root.$broadcast(fnName, params);
        };

        $scope.getHidden = function(){
          Entity.get({id: "hidden"}, {
            limit: 100  //if we have more than 100 hidden items we have some housekeeping to do
          }, function(result){
            if(resultHandler.process(result)){
              $scope.hidden = result.data;
            }
          });
        };

        $scope.getFlagged = function(){
          Entity.get({id: "flagged"}, {
            limit: 100  //if we have more than 100 flagged items we have some housekeeping to do
          }, function(result){
            if(resultHandler.process(result)){
              //$scope.flagged = result.data;
              if(result.data){
                for(var i=0;i<result.data.length;i++){
                  $scope.flagged[result.data[i].entityId] = true;
                }
              }
            }
          });
        };

        $scope.getHidden();
        $scope.getFlagged();

        $scope.isHidden = function(id){
          for(var i=0;i<$scope.hidden.length;i++){
            if($scope.hidden[i]._id == id){
              return true;
            }
          }
          return false;
        };

        $scope.isFlagged = function(id){
          if($scope.flagged){
            for(var i=0;i<$scope.flagged.length;i++){
              if($scope.flagged[i].entityId == id){
                return true;
              }
            }
            return false;
          }
          return false;
        };

        $scope.$on('searchResults', function(event, hasResults){
          if(hasResults){
            if($scope.info){
              $scope.render();
            }
            else{
              $scope.postponed = function(){
                $scope.render();
              }
            }
          }
          else{
            $scope.renderEmpty();
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

        $scope.$on('searching', function(){
          $scope.loading = true;
          $scope.pageTop = 0;
        });

        $scope.$on("update", function(params){
          if($scope.info){
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

        $scope.showItem = function(approved, entity){
          return approved=='True' || userManager.canApprove(entity);
        };

        $scope.changePage = function(direction){
          $scope.pageTop += ($scope.config.pagesize * direction);
          $scope.render();
        };

        $scope.setPage = function(pageNumber){
          $scope.pageTop = ($scope.config.pagesize * pageNumber);
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
            $scope.qFields = layout.qHyperCube.qDimensionInfo.concat(layout.qHyperCube.qMeasureInfo);
            $scope.info.object.getHyperCubeData("/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:0, qHeight: $scope.config.pagesize, qWidth: $scope.fields.length }]).then(function(data){
              $scope.$apply(function(){
                $scope.loading = false;
                $scope.pageTop = data[0].qArea.qTop;
                $scope.pageBottom = (data[0].qArea.qTop + data[0].qArea.qHeight);
                $scope.currentPage = Math.ceil($scope.pageBottom / $scope.config.pagesize);
                $scope.total = layout.qHyperCube.qSize.qcy;
                $scope.pages = [];
                for(var i=1;i<(Math.ceil($scope.total/$scope.config.pagesize)+1);i++){
                  $scope.pages.push(i);
                }
                $scope.items = data[0].qMatrix.map(function(row){
                  var item = {}
                  for (var i=0; i < row.length; i++){
                    item[$scope.qFields[i].qFallbackTitle] = row[i].qText;
                  }
                  return item;
                });
                if(layout.qHyperCube.qSize.qcx < $scope.fields.length){
                  $scope.pageWidth();
                }
              });
            });
          });
        };

        $scope.renderEmpty = function(){
          $scope.loading = false;
          $scope.items = [];
        };

        $scope.pageWidth = function(){  //we currently only support paging width once (i.e. up to 20 fields)
          $scope.info.object.getHyperCubeData("/qHyperCubeDef", [{qTop: $scope.pageTop, qLeft:10, qHeight: $scope.config.pagesize, qWidth: $scope.fields.length }]).then(function(data){
            $scope.$apply(function(){
              data[0].qMatrix.map(function(row, index){
                var item = $scope.items[index];
                for (var i=0; i < row.length; i++){
                  item[$scope.qFields[i].qFallbackTitle] = row[i].qText;
                }
                return item;
              });
            });
          });
        };

        $scope.applySort = function(sort){
          $scope.info.object.applyPatches([{
            qPath: "/qHyperCubeDef/qInterColumnSortOrder",
            qOp: "replace",
            qValue: getFieldIndex(sort.field)
          }], true).then(function(result){
            $scope.render();
          });
        };

        function getFieldIndex(field, asString){
          for (var i=0;i<$scope.fields.length;i++){
            if($scope.fields[i].dimension && $scope.fields[i].dimension==field){
              if(asString!=undefined && asString==false){
                return [i];
              }
              else {
                return "["+i+"]";
              }
            }
            else if ($scope.fields[i].label && $scope.fields[i].label==field) {
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

        searchExchange.addResults({
            id: $(element).attr("id"),
            fields: $scope.fields,
            sortOptions: $scope.sortOptions,
            defaultSort: getFieldIndex($scope.sort.field, false)
          }, function(result){
          $scope.$apply(function(){
            $scope.info = result;
            if($scope.postponed){
              $scope.postponed.call(null);
            }
            // else{
            //   $scope.render();
            // }
          });
        });

      }});
    },
    templateUrl: "/views/search/search-results.html"
  }
}])

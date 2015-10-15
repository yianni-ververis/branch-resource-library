(function() {
  var app = angular.module("branch", ["ui.router", "ngResource", "ngConfirm", "ngNotifications", "ngComments", "ngModeration", "ngSanitize", 'ui.bootstrap' ]);

  app.config(["$stateProvider","$urlRouterProvider", "confirmConfigProvider", "notificationConfigProvider", "commentsConfigProvider", "moderationConfigProvider", function($stateProvider, $urlRouterProvider, notificationsConfigProvider, confirmConfigProvider, commentsConfig, moderationConfig) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
    //home page
    .state("home", {
      url: "/",
      templateUrl: "/views/home/index.html",
      controller: "homeController",
      data:{
        crumb: "Home"
      }
    })
    //login and signup page
    .state("loginsignup", {
      url: "/loginsignup?url",
      templateUrl : "/views/loginsignup.html",
      controller: "authController",
      data: {
        crumb: "Login",
        link: "loginsignup"
      }
    })
    //login page
    //used if a session has expired or user is not logged in and tries to navigate to a page that requires authentication
    .state("login", {
      url: "/login?url",
      templateUrl : "/views/login.html",
      controller: "authController",
      data: {
        crumb: "Login",
        link: "login"
      }
    })
    //password reset page
    //used if a session has expired or user is not logged in and tries to navigate to a page that requires authentication
    .state("reset", {
      url: "/reset",
      templateUrl : "/views/reset.html",
      controller: "authController",
      data: {
        crumb: "Login",
        link: "login"
      }
    })
    //used to navigate to the admin console
    .state("admin", {
      url: "/admin",
      templateUrl: "/views/admin/index.html",
      controller: "adminController",
      data: {
        crumb: "Admin"
      }
    })
    //used to navigate to the project list page
    .state("projects", {
      url: "/projects?sort&category&product",
      templateUrl: "/views/projects/index.html",
      controller: "projectController",
      data: {
        crumb: "Projects",
        link: "projects"
      }
    })
    //used to navigate to a given project detail page
    .state("projects.detail", {
      url: "/:projectId",
      views:{
        "@":{
          templateUrl: "/views/projects/detail.html",
          controller: "projectController",
        }
      },
      data:{
        crumb: "New Project",
        link: "projects/new"
      }
    })
    //used to navigate to a given project detail page
    .state("projects.addedit", {
      url: "/:projectId/edit",
      views:{
        "@":{
          templateUrl: "/views/projects/addedit.html",
          controller: "projectController",
        }
      },
      data:{
        crumb: "New Project",
        link: "projects/new"
      }
    })
    //used to navigate to the blog list page
    .state("blogs", {
      url: "/blogs",
      templateUrl: "/views/blogs/index.html",
      controller: "blogController",
      data: {
        crumb: "Blogs",
        link: "blogs"
      }
    })
    //used to navigate to a given blog detail page
    .state("blogs.detail", {
      url: "/:blogId",
      views:{
        "@":{
          templateUrl: "/views/blogs/detail.html",
          controller: "blogController",
        }
      },
      data:{
        crumb: "New Blog",
        link: "blogs/detail"
      }
    })
    //used to navigate to a the blog add/edit page
    .state("blogs.addedit", {
      url: "/:blogId/edit",
      views:{
        "@":{
          templateUrl: "/views/blogs/addedit.html",
          controller: "blogController",
        }
      },
      data:{
        crumb: "New Blog",
        link: "blogs/new"
      }
    })
    //used to navigate to a user list page (not currently used)
    .state("users", {
      url: "/users?sort",
      templateUrl: "/views/users/index.html",
      controller: "userController",
      data: {
        crumb: "Users"
      }
    })
    //used to navigate to a given project detail page
    .state("users.detail", {
      url: "/:userId",
      templateUrl: "/views/users/detail.html",
      controller: "userController",
      data: {
        crumb: "Detail"
      }
    })
  }]);

  //directives
  //include "./directives/paging.js"
  app.directive('header', ['userManager', '$state', '$interpolate', function (userManager, $state, $interpolate) {
    return {
      restrict: "A",
      replace: true,
      scope:{

      },
      templateUrl: "/views/header.html",
      link: function(scope){
        scope.userManager = userManager;
        scope.breadcrumbs;
        scope.$on('$stateChangeSuccess', function() {
          scope.activeItem = $state.current.name.split(".")[0];
          scope.breadcrumbs = [];
          var state = $state.$current;
          if(state.self.name != "home"){
            while(state.self.name != ""){
              scope.breadcrumbs.push({
                text: state.data.crumb,
                link: state.data.link
              });
              state = state.parent;
            }
            scope.breadcrumbs.push({text: "Home", link: "/"});
          }
          scope.breadcrumbs.reverse();
        });
        scope.$on('spliceCrumb', function(event, crumb){
          scope.breadcrumbs.splice(-1, 1, crumb);
        });
        scope.$on('addCrumb', function(event, crumb){
          scope.breadcrumbs.push(crumb);
        });
        scope.getLoginUrl = function(){
          var suffix = "";
          if($state.$current.name!="home"){
            suffix += "?url=";
          }
          if(window.location.hash.indexOf('login')==-1){
            suffix += window.location.hash.replace("#/","");
          }
          return "#loginsignup"+suffix;
        }
      }
    }
  }]);

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngConfirm', []);
    module.provider('confirmConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('confirm', ['$rootScope', function ($rootScope) {
  		return {
  			prompt: function(message, options, callbackFn){
  				$rootScope.$broadcast('confirmPrompt', {message: message, options: options, callbackFn: callbackFn});
  			}
  		};
    }]);


    module.directive('confirmDialog', ['confirmConfig', '$timeout', function (confirmConfig, $timeout) {
      return {
  			restrict: "E",
  			scope:{

  			},
        template: function(elem, attr){
          html = "<div class='confirm-smokescreen' ng-class='{active:active==true}'>";
          html += "<div class='confirm-dialog'>";
          html += "<p>{{message}}</p>";
          html += "<ul>";
          html += "<li ng-repeat='option in options'><button class='ghost-button grey' ng-click='returnOption($index)'>{{option}}</button></li>";
          html += "</ul>";
          html += "</div>";
  	      html += "</div>";
  				return html;
        },
        link: function(scope){
  				scope.$on('confirmPrompt', function(event, data){
            scope.message = data.message;
            scope.options = data.options;
            scope.callback = data.callbackFn;
            scope.active = true;
          });
          scope.returnOption = function(index){
            scope.message = null;
            scope.options = null;
            scope.active = false;
            scope.callback.call(null, index);
            scope.callback = null;
          };
        }
      }
    }]);

  	return module;
  }));

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngNotifications', []);
    module.provider('notificationConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('notifications', ['$rootScope', function ($rootScope) {
  		return {
  			notify: function(message, list, options){
  				$rootScope.$broadcast('notify', {message: message, list: list, options: options});
  			}
  		};
    }]);


    module.directive('notificationDialog', ['notificationConfig', '$timeout', function (confirmConfig, $timeout) {
      return {
  			restrict: "E",
  			scope:{

  			},
        template: function(elem, attr){
          html = "<div ng-show='showing' class='{{options.sentiment}} col-md-12 notifications'>";
  				html += "<p>{{message}}</p>";
  				html += "<ul ng-if='list.length>0'>";
  				html += "<li ng-repeat='item in list'>";
  				html += "{{item}}"
  				html += "</li>";
  				html += "</ul>";
  	      html += "</div>";
  				return html;
        },
        link: function(scope){
  				scope.$on('notify', function(event, data){
  					scope.showing = true;
            scope.message = data.message || "";
  					scope.list = data.list || [];
  					scope.options = data.options || {};
          });
        }
      }
    }]);

  	return module;
  }));

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngComments', []);
    module.provider('commentsConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('comments', ['$rootScope', function ($rootScope) {
  		return {

  		};
    }]);

    module.directive('comments', ['commentsConfig', '$timeout', function (confirmConfig, $timeout) {
      return {
  			restrict: "A",
  			scope:{
          entity: "=",
          entityid: "=",
  				parent: "="
  			},
        templateUrl: "/views/comments.html",
        link: function(scope){

        },
        controller: "commentController"
      }
    }]);

  	return module;
  }));

  (function (root, factory) {
  	if (typeof exports === 'object') {
  		module.exports = factory(root, require('angular'));
  	} else if (typeof define === 'function' && define.amd) {
  		define(['angular'], function (angular) {
  			return (root.ngConfirm = factory(root, angular));
  		});
  	} else {
  		root.ngConfirm = factory(root, root.angular);
  	}
  }(this, function (window, angular) {
  	var module = angular.module('ngModeration', []);
    module.provider('moderationConfig', function() {
      return {
  			$get: function(){
  				return {}
  			}
  		};
    });

    module.factory('moderation', ['$rootScope', function ($rootScope) {
  		return {

  		};
    }]);

    module.directive('moderation', ['moderationConfig', '$timeout', function (confirmConfig, $timeout) {
      return {
  			restrict: "E",
  			replace: true,
  			scope:{
          entity: "=",
          entityid: "=",
  				owner: "=",
  				approved: "=",
  				flagged: "=",
  				flagcount: "=",
  				editable: "=",
  				download: "=",
  				size: "=",
  				orientation: "="
  			},
        templateUrl: "/views/moderation.html",
        link: function(scope){

        },
        controller: "moderationController"
      }
    }]);

  	return module;
  }));

  app.directive('searchInput', ['searchExchange', '$state', '$interpolate', function (searchExchange, $state, $interpolate) {
    return {
      restrict: "E",
      replace: true,
      scope:{
        onlyapproved: "="
      },
      templateUrl: "/views/search/search-input.html",
      link: function(scope){
        var ignoreKeys = [
          16,
          27
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

        var Key = {
            BACKSPACE: 8,
            ESCAPE: 27,
            TAB: 9,
            ENTER: 13,
            SHIFT: 16,
            UP: 38,
            DOWN: 40,
            RIGHT: 39,
            LEFT: 37,
            DELETE: 46,
            SPACE: 32
        };

        scope.searchText = "";

        scope.searchTimeout = 300;
        scope.suggestTimeout = 100;
        scope.searchTimeoutFn;
        scope.suggestTimeoutFn;
        scope.suggesting = false;
        scope.activeSuggestion = 0;

        scope.cursorPosition = 0;
        scope.$on('senseready', function(params){
          console.log('sense is ready');
        });

        scope.$on('searchResults', function(event, results){

        });

        scope.$on('suggestResults', function(event, results){

          scope.suggestions = results.qSuggestions;
          scope.showSuggestion();
        });

        scope.$on('cleared', function(results){
          scope.searchText = "";
          scope.cursorPosition = 0;
          scope.suggestions = [];
          scope.suggesting = false;
          scope.activeSuggestion = 0;
          scope.ghostPart = "";
          scope.ghostQuery = "";
          scope.ghostDisplay = "";
        });



        scope.keyDown = function(event){
          if(event.keyCode == Key.ESCAPE){
            scope.hideSuggestion();
            return;
          }
          if(event.keyCode == Key.DOWN){
            //show the suggestions again
            scope.showSuggestion();
          }
          if(event.keyCode == Key.RIGHT){
            //activate the next suggestion
            if(scope.suggesting){
              event.preventDefault();
              scope.nextSuggestion();
            }
          }
          if(event.keyCode == Key.LEFT){
            //activate the previous suggestion
            if(scope.suggesting){
              event.preventDefault();
              scope.prevSuggestion();
            }
          }
          if(event.keyCode == Key.ENTER || event.keyCode == Key.TAB){
            if(scope.suggesting){
              event.preventDefault();
              scope.acceptSuggestion();
            }
          }
          if(event.keyCode == Key.SPACE){
              scope.hideSuggestion();
          }

        };

        scope.keyUp = function(event){
          scope.cursorPosition = event.target.selectionStart;
          if(ignoreKeys.indexOf(event.keyCode) != -1){
            return;
          }
          if(reservedKeys.indexOf(event.keyCode) == -1){
            if(scope.searchText.length > 0){
              scope.preSearch();
              scope.preSuggest();
            }
            else{
              //clear the search
              scope.clear();
            }
          }
        };

        scope.nextSuggestion = function(){
          if(scope.activeSuggestion==scope.suggestions.length-1){
            scope.activeSuggestion = 0;
          }
          else{
            scope.activeSuggestion++;
          }
          scope.drawGhost();
        };
        scope.prevSuggestion = function(){
          if(scope.activeSuggestion==0){
            scope.activeSuggestion = scope.suggestions.length-1;
          }
          else{
            scope.activeSuggestion--;
          }
          scope.drawGhost();
        };
        scope.hideSuggestion = function(){
          scope.suggesting = false;
          scope.activeSuggestion = 0;
          scope.ghostPart = "";
          scope.ghostQuery = "";
          scope.ghostDisplay = "";
        };
        scope.showSuggestion = function(){
          if(scope.searchText && scope.searchText.length > 1 && scope.cursorPosition==scope.searchText.length && scope.suggestions.length > 0){
            scope.suggesting = true;
            scope.drawGhost();
          }
          else{
            scope.suggesting = false;
            scope.removeGhost();
          }
        };
        scope.setAndAccept = function(index){
          scope.activeSuggestion = index;
          scope.drawGhost();
          scope.acceptSuggestion();
        }
        scope.acceptSuggestion = function(){
          scope.searchText = scope.ghostQuery;
          scope.suggestions = [];
          scope.hideSuggestion();
          scope.preSearch();
        };
        scope.drawGhost = function(){
          scope.ghostPart = getGhostString(scope.searchText, scope.suggestions[scope.activeSuggestion].qValue);
          scope.ghostQuery = scope.searchText + scope.ghostPart;
          scope.ghostDisplay = "<span style='color: transparent;'>"+scope.searchText+"</span>"+scope.ghostPart;
        }
        scope.removeGhost = function(){
          scope.ghostPart = null;
          scope.ghostQuery = null;
          scope.ghostDisplay = null;
        }

        scope.preSuggest = function(){
          if(scope.searchText.length > 1 && scope.cursorPosition==scope.searchText.length){
            if(scope.suggestTimeoutFn){
              clearTimeout(scope.suggestTimeoutFn);
            }
            scope.suggestTimeoutFn = setTimeout(function(){
              searchExchange.suggest(scope.searchText);
            }, scope.suggestTimeout);
          }
        };

        scope.preSearch = function(){
          if(scope.searchTimeoutFn){
            clearTimeout(scope.searchTimeoutFn);
          }
          scope.searchTimeoutFn = setTimeout(function(){
            searchExchange.search(scope.searchText);
          }, scope.searchTimeout);
        };

        scope.clear = function(){
          searchExchange.clear();
        };

        function getGhostString(query, suggestion){
          var suggestBase = query;
          while(suggestBase.length > suggestion.length){
            suggestBase = suggestBase.split(" ");
            suggestBase.splice(0,1);
            suggestBase = suggestBase.join(" ");
          }
          var re = new RegExp(suggestBase, "i")
          return suggestion.replace(re,"");
        }
      }
    }
  }]);

  app.directive("searchFilter", ["searchExchange", function(searchExchange){
    return {
      restrict: "E",
      replace: true,
      scope: {

      },
      link: function($scope, element, attr){
        $scope.title = attr.title;

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

        $scope.render = function(){
          $scope.info.object.getLayout().then(function(layout){
            $scope.info.object.getListObjectData("/qListObjectDef", [{qTop:0, qLeft:0, qHeight:layout.qListObject.qSize.qcy, qWidth: 1 }]).then(function(data){
              $scope.$apply(function(){              
                $scope.info.items = data[0].qMatrix;
              });
            });
          });
        };

        $scope.selectValue = function(value){
          $scope.info.object.selectListObjectValues("/qListObjectDef", [value], true).then(function(){
            searchExchange.render();
          });
        };

        searchExchange.addFilter({
            id: $(element).attr("id"),
            field: attr.field
          }, function(result){
          $scope.$apply(function(){
            $scope.info = result;
            if($scope.postponed){
              $scope.postponed.call(null);
            }
            else{
              $scope.render();
            }

          });
        });

      },
      templateUrl: "/views/search/search-filter.html"
    }
  }])

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
              else{
                $scope.render();
              }
            });
          });

        }});
      },
      templateUrl: "/views/search/search-results.html"
    }
  }])

  //services
  app.service('userManager', ['$resource', function($resource){
    var System = $resource("system/:path", {path: "@path"});
    this.menu = {};
    this.userInfo = {};
    var that = this;
    this.refreshing = false;
    this.canUpdateAll = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].allOwners && this.userInfo.role.permissions[entity].allOwners==true;
    }
    this.canCreate = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].create && this.userInfo.role.permissions[entity].create==true;
    }
    this.canRead = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].read && this.userInfo.role.permissions[entity].read==true;
    }
    this.canUpdate = function(entity, owner){
      if (this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].update && this.userInfo.role.permissions[entity].update==true){
        if(!this.userInfo.role.permissions[entity].allOwners || this.userInfo.role.permissions[entity].allOwners==false){
          if(this.userInfo._id==owner){
            return true;
          }
          else{
            return false;
          }
        }
        else{
          return true
        }
      }
    }
    this.canApprove = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].approve && this.userInfo.role.permissions[entity].approve==true;
    }
    this.canFlag = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].flag && this.userInfo.role.permissions[entity].flag==true;
    }
    this.canHide = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].hide && this.userInfo.role.permissions[entity].hide==true;
    }
    this.canDelete = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].delete && this.userInfo.role.permissions[entity].delete==true;
    }
    this.hasUser = function(){
      return !$.isEmptyObject(that.userInfo);
    }
    this.refresh = function(callbackFn){
      this.refreshing = true;
      System.get({path:'userInfo'}, function(result){
        that.menu = result.menu;
        that.userInfo = result.user;
        if(callbackFn){
          callbackFn.call(null, that.hasUser());
        }
      });
    }
    this.hasPermissions = function(){
      return this.userInfo && this.userInfo.role && this.userInfo.role.permissions;
    }
    this.refresh();
  }]);

  app.service('resultHandler', ["notifications", function(notifications){
    this.processing = false;
    this.process = function(result, action, preventRedirect){   //deals with the result in a generic way. Return true if the result is a success otherwise returns false
      if(result.redirect && !preventRedirect){  //should only redirect a user to the login page
        if(!this.processing){
          this.processing = true;
          window.location = result.redirect + "?url=" + window.location.hash.replace("#/","");
        }
        return false;
      }
      else if (result.errCode) {      
        // notifications.showError({
        //   message: result.errText,
        //   hideDelay: 3000,
        //   hide: true
        // });
        return false;
      }
      else {
        //if an action has been passed notify the user of it's success
        if(action){
          notifications.showSuccess({message: action + " Successful"});
        }
        return true;
      }
    }
  }]);

  app.service('searchExchange', ["$rootScope", "userManager", function($rootScope, userManager){
    var that = this;
    var config = {
      host: "10.211.55.3:8080/anon",
      isSecure: false
    };
    // var config = {
    //   host: "diplomaticpulse.qlik.com",
    //   isSecure: true
    // };

    this.objects = {};
    this.online = false;

    this.priority;
    this.queue = [];

    this.pendingSearch;
    this.pendingSuggest;

    var senseApp;

    qsocks.Connect(config).then(function(global){
      global.openDoc("bf6c1ed8-69fb-4378-86c2-a1c71a2b3cc1").then(function(app){
      //global.openDoc("b8cd05a8-bb43-4670-bda5-1b6ff16640b8").then(function(app){
        senseApp = app;
        $rootScope.$broadcast("senseready", app);
      }, function(error) {
          if (error.code == "1002") { //app already opened on server
              global.getActiveDoc().then(function(app){
                senseApp = app;
                $rootScope.$broadcast("senseready", app);
              });
          } else {
              console.log(error)
              $rootScope.$broadcast("senseoffline");
          }
      });
    });
    $rootScope.$on("senseready", function(params){
      that.executePriority();
      console.log('connected to sense app');
      that.online = true;
    });
    $rootScope.$on("senseoffline", function(params){
      console.log('could not connected to sense app. using mongo instead.');
      that.online = false;
    });

    this.init = function(defaultSelection){
      if(defaultSelection){
        that.addFilter({field: defaultSelection.field}, function(result){
          //result.object.getLayout().then(function(layout){
              //result.object.getListObjectData("/qListObjectDef", [{qTop:0, qLeft:0, qHeight:layout.qListObject.qSize.qcy, qWidth: 1 }]).then(function(data){
                result.object.selectListObjectValues("/qListObjectDef", defaultSelection.values, true).then(function(){
                  if(defaultSelection.lock==true){
                    result.object.lock("/qListObjectDef").then(function(){
                      that.executeQueue();
                    });
                  }
                  else{
                    that.executeQueue();
                  }
                });
              //});
          //});
        }, true);
      }
      else{
          that.executeQueue();
      }
    };

    this.executeQueue = function(){
      for (var i=0;i<that.queue.length;i++){
        that.queue[i].call();
      }
      $rootScope.$broadcast("update");
    };

    this.executePriority = function(){
      if(that.priority){
        that.priority.call(null);
      }
      else{
        that.executeQueue();
      }
    };

    this.clear = function(unlock){
      if(senseApp){
        if(unlock && unlock==true){
          senseApp.unlockAll().then(function(){
            senseApp.clearAll().then(function(){
                $rootScope.$broadcast("cleared");
            });
          });
        }
        else{
          senseApp.clearAll().then(function(){
              $rootScope.$broadcast("cleared");
          });
        }
      }
      else{
        $rootScope.$broadcast("cleared");
      }
    };

    this.render = function(){
      $rootScope.$broadcast("update");
    }
    this.fresh = function(){
        this.search("");
    }

    this.search = function(searchText){
      $rootScope.$broadcast("searching");
      that.terms = searchText.split(" ");

      senseApp.searchAssociations({qContext: "Cleared"}, that.terms, {qOffset: 0, qCount: 5, qMaxNbrFieldMatches: 5}).then(function(results){
        console.log(results);
        if(results.qTotalSearchResults > 0){
          senseApp.selectAssociations({qContext: "Cleared"}, that.terms, 0 ).then(function(results){
            $rootScope.$broadcast('searchResults', true);
          });
        }
        else{
          $rootScope.$broadcast('searchResults', false)
        }
      });
    };

    this.suggest = function(searchText){
      senseApp.searchSuggest({}, searchText.split(" ")).then(function(results){
        console.log(results);
        $rootScope.$broadcast('suggestResults', results);
      });
    };

    this.addFilter = function(options, callbackFn, priority){
      var fn;
      if(that.objects[options.id]){
        fn = function(){
          callbackFn.call(null, {object:that.objects[options.id]});
        }
      }
      else{
        fn = function(){
          var lbDef = {
            qInfo:{
              qType: "ListObject"
            },
            qListObjectDef:{
              qStateName: "$",
              qDef:{
                qFieldDefs:[options.field]
              },
              qAutoSortByState: {
                qDisplayNumberOfRows: 8
              }
            }
          };
          senseApp.createSessionObject(lbDef).then(function(response){
            //callbackFn.call(null, {handle: response.handle, object: new qsocks.GenericObject(response.connection, response.handle)});
            callbackFn.call(null, {object: response});
          });
        };
      }
      if(that.online){
        fn.call();
      }
      else{
        if(priority){
          that.priority = fn;
        }
        else{
          that.queue.push(fn);
        }
      }
    };

    //this.addResults = function(fields, pageSize, sorting, defaultSort, callbackFn, priority){
    this.addResults = function(options, callbackFn, priority){
      var fn;
      if(that.objects[options.id]){
        fn = function(){
          callbackFn.call(null, {object:that.objects[options.id]});
        }
      }
      else{
        //create a new session object
        fn = function(){
          var hDef = {
            "qInfo" : {
                "qType" : "table"
            },
            "qHyperCubeDef": {
              "qDimensions" : buildFieldDefs(options.fields, options.sortOptions),
              "qMeasures": buildMeasureDefs(options.fields),
            	"qSuppressZero": true,
            	"qSuppressMissing": true,
            	"qInterColumnSortOrder": options.defaultSort
            }
          }
          senseApp.createSessionObject(hDef).then(function(response){
            that.objects[options.id] = response;
            callbackFn.call(null, {object:response});
          });
        }
      }
      if(that.online){
        fn.call();
      }
      else{
        that.queue.push(fn);
      }
    }

    function buildFieldDefs(fields, sorting){
      var defs = [];
      for (var i=0;i<fields.length;i++){
        if(fields[i].dimension){
          var def = {
      			"qDef": {
      				"qFieldDefs": [fields[i].dimension]
            },
            qNullSuppression: fields[i].suppressNull
      		}
          if(sorting[fields[i].dimension]){
            var sort = {
              //"autoSort": false
              //"qSortByLoadOrder" : 1
            };
            sort[sorting[fields[i].dimension].sortType] = sorting[fields[i].dimension].order;
            def["qDef"]["qSortCriterias"] = [sort];
          }
          defs.push(def);
        }
      }
      return defs;
    }

    function buildMeasureDefs(fields){
      var defs = [];
      for (var i=0;i<fields.length;i++){
        if(fields[i].measure){
          var def = {
            "qDef": {
    					"qLabel": fields[i].label,
    					"qDescription": "",
    					"qDef": fields[i].measure
    				}
          }
          if(fields[i].sortType){
            def["qSortBy"] = {};
            def["qSortBy"][fields[i].sortType] = fields[i].order;
          }
          defs.push(def);
        }
      };
      return defs;
    }

  }])

  app.service('picklistService', ['$resource', 'resultHandler', function($resource, resultHandler){
    var Picklist = $resource("api/picklists/:picklistId", {picklistId: "@picklistId"});
    var PicklistItem = $resource("api/picklistitems/:picklistitemId", {picklistitemId: "@picklistitemId"});

    this.getPicklistItems = function(picklistName, callbackFn){
      Picklist.get({name: picklistName}, function(result){
        if(resultHandler.process(result)){
          if(result.data && result.data[0]){
            PicklistItem.get({picklistId: result.data[0]._id}, function(result){
              if(resultHandler.process(result)){
                callbackFn.call(null, result.data);
              }
            });
          }
        }
      });
    };

  }]);

  //controllers
  app.controller("adminController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "searchExchange", function($scope, $resource, $state, $stateParams, userManager, resultHandler, searchExchange){
    var User = $resource("api/users/:userId", {userId: "@userId"});
    var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
    var Article = $resource("api/articles/:articleId", {articleId: "@articleId"});
    var UserRoles = $resource("api/userroles/:roleId", {roleId: "@roleId"});
    var Feature = $resource("api/features/:featureId", {featureId: "@featureId"});
    var Picklist = $resource("api/picklists/:picklistId", {picklistId: "@picklistId"});
    var PicklistItem = $resource("api/picklistitems/:picklistitemId", {picklistitemId: "@picklistitemId"});

    $scope.userManager = userManager;

    $scope.collections = [
      "users",
      "userroles",
      "features",
      "projects",
      "comments",
      "blogs",
      "picklists",
      "picklistitems",
      "flags"
    ];

    var defaultSelection;

    $scope.$on("cleared", function(){
      searchExchange.init(defaultSelection);
    })

    $scope.pageSize = 20;

    User.get({}, function(result){
      if(resultHandler.process(result)){
        $scope.users = result.data;
        $scope.userInfo = result;
        delete $scope.userInfo["data"];
      }
    });

    UserRoles.get({}, function(result){
      if(resultHandler.process(result)){
        $scope.roles = result.data;
        $scope.roleInfo = result;
        delete $scope.roleInfo["data"];
        $scope.setRole(0);
      }
    });

    Feature.get({}, function(result){
      if(resultHandler.process(result)){
        $scope.features = result.data;
        $scope.featureInfo = result;
        delete $scope.featureInfo["data"];
        $scope.setActiveFeature(0);
      }
    });

    Picklist.get({}, function(result){
      if(resultHandler.process(result)){
        $scope.picklists = result.data;
        $scope.picklistInfo = result;
        delete $scope.picklistInfo["data"];
        $scope.setActivePickList(0);
      }
    });

    $scope.activeRole = 0;

    $scope.activePicklist = 0;

    $scope.activeTab = 0;

    $scope.activeFeature = 0;

    $scope.setTab = function(index){
      $scope.activeTab = index;
      searchExchange.clear();
    };

    $scope.setRole = function(index){
      $scope.activeRole = index;
      $scope.copyRoleName = $scope.roles[$scope.activeRole].name;
    };

    $scope.setActivePickList = function(index){
      $scope.activePicklist = index;
      $scope.getPicklistItems($scope.picklists[index]._id);
      $scope.copyListName = $scope.picklists[$scope.activePicklist].name;
    };

    $scope.setActiveFeature = function(index){
      $scope.activeFeature = index;
      if($scope.features[$scope.activeFeature].name=="project"){
        Project.get({projectId: $scope.features[$scope.activeFeature].entityId}, function(result){
          if(resultHandler.process(result)){
            if(result.data.length > 0){
              $scope.currentFeature = result.data[0];  
            }
          }
        })
      }
    };

    $scope.saveRole = function(){
      console.log($scope.roles[$scope.activeRole]);
      UserRoles.save({roleId:$scope.roles[$scope.activeRole]._id}, $scope.roles[$scope.activeRole], function(result){
        if(resultHandler.process(result, "Save")){
          $scope.userManager.refresh();
        }
      });
    };

    $scope.savePicklist = function(){
      console.log($scope.picklists[$scope.activePicklist]);
      Picklists.save({picklistId:$scope.picklists[$scope.activePicklist]._id}, $scope.picklists[$scope.activePicklist], function(result){
        if(resultHandler.process(result, "Save")){

        }
      });
    };

    $scope.newRole = function(newrolename){
      var that = this;
      UserRoles.save({}, {name: newrolename}, function(result){
        if(resultHandler.process(result, "Create")){
          $scope.roles.push(result);
          that.newrolename = "";
          $scope.setRole($scope.roles.length -1);
        }
      });
    };

    $scope.newPicklist = function(newlistname){
      var that = this;
      Picklist.save({}, {name: newlistname}, function(result){
        if(resultHandler.process(result, "Create")){
          $scope.picklists.push(result);
          that.newlistname = "";
          $scope.setActivePickList($scope.picklists.length -1);
        }
      });
    };

    $scope.newPicklistItem = function(newlistitem){
      var that = this;
      var item = {
        name: newlistitem,
        picklistId: $scope.picklists[$scope.activePicklist]._id
      };
      that.newlistitem = "";
      $scope.savePicklistItem(item);
    };

    $scope.getPicklistItems = function(picklistId){
      PicklistItem.get({picklistId: picklistId}, function(result){
        if(resultHandler.process(result)){
          $scope.picklistItems = result.data;
        }
      });
    };

    $scope.savePicklistItem = function(item){
      PicklistItem.save({picklistitemId: item._id || ""}, item, function(result){
        if(resultHandler.process(result, "Save")){
          if($scope.picklistItems){
            $scope.picklistItems.push(result);
          }
          else{
            $scope.picklistItems = [result];
          }
        }
      });
    };

    $scope.copyRole = function(copyrolename){
      var roleToCopy = $scope.roles[$scope.activeRole];
      if(copyrolename==roleToCopy.name){
        copyrolename += " - copy";
      }
      UserRoles.save({}, {name: copyrolename, permissions: roleToCopy.permissions}, function(result){
        if(resultHandler.process(result, "Copy")){
          $scope.roles.push(result);
          $scope.setRole($scope.roles.length -1);
        }
      });
    };

    $scope.$on('setFeature', function(event, args){
      $scope.setFeature(args[0]);
    });

    $scope.setFeature = function(id){
      //if($scope.features[$scope.activeFeature].name=="project"){
        $scope.features[$scope.activeFeature].entityId = id;
        Feature.save({featureId: $scope.features[$scope.activeFeature]._id }, {entityId: id}, function(result){
          if(resultHandler.process(result)){
            $scope.setActiveFeature($scope.activeFeature);
          }

        });
      //}
    };

    $scope.saveFeature = function(){
      Feature.save({featureId: $scope.features[$scope.activeFeature]._id }, $scope.features[$scope.activeFeature], function(result){
        resultHandler.process(result);
      });
    };

    $scope.highlightRow = function(id){
      if($scope.features[$scope.activeFeature].entityId==id){
        return true;
      }
      return false;
    }
  }]);

  app.controller("authController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", function($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications){
    var Login = $resource("auth/login");
    var Signup = $resource("auth/signup");
    var Reset = $resource("auth/reset")

    if($stateParams.url){
      $scope.returnUrl = $stateParams.url.replace(/%2F/gi, '');
    }

    $scope.login = function(){
      Login.save({
        username: $scope.loginusername,
        password: $scope.loginpassword
      }, function(result){
        if(resultHandler.process(result)){
          userManager.refresh();
          window.location = "#" + $scope.returnUrl || "/";
        }
        else{
          notifications.notify(result.errText, null, {sentiment: 'negative'});
        }
      });
    };

    $scope.signup = function(){
      Signup.save({
        username: $scope.username,
        password: $scope.password,
        email: $scope.email
      }, function(result) {
        if(resultHandler.process(result)){
          userManager.refresh();
          window.location = "#" + $scope.returnUrl || "/";
        }
        else{
          notifications.notify(result.errText, null, {sentiment: 'negative'});
        }
      })
    };

    $scope.reset = function() {
      Reset.save({
        email: $scope.email2
      }, function(result) {
        if(resultHandler.process(result)){
          userManager.refresh();
          window.location = "#" + $scope.returnUrl || "/";
        }
        else{
          notifications.notify(result.errText, null, {sentiment: 'negative'});
        }
      })
    };

  }]);

  app.controller("homeController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
    var Feature = $resource("api/features/:featureId", {featureId: "@featureId"});
    var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
    var Article = $resource("api/articles/:articleId", {articleId: "@articleId"});

    $scope.featuredProject = {};
    $scope.featuredArticle = {};

    Feature.get({}, function(result){
      if(resultHandler.process(result)){
        $scope.features = result.data;
        $scope.featureInfo = result;
        delete $scope.featureInfo["data"];

        //get the featured content
        for(var f in $scope.features){
          var entityId = $scope.features[f].entityId;
          switch ($scope.features[f].name){
            case "project":
            $scope.featuredProject.comment = $scope.features[f].comment;
              Project.get({projectId: entityId}, function(result){
                if(resultHandler.process(result)){
                  $scope.featuredProject.project = result.data[0];
                }
              });
              break;
            case "article":
            $scope.featuredArticle.comment = $scope.features[f].comment;
              Article.get({articleId: entityId}, function(result){
                if(resultHandler.process(result)){
                  $scope.featuredArticle.article = result.data[0];
                }
              });
              break;
          }
        }
      }
    });

    //Get the latest 5 projects
    Project.get({sort: 'dateline', sortOrder:'-1', limit:'3'}, function(result){
      if(resultHandler.process(result)){
        $scope.latestProjects = result.data;
      }
    });

    Article.get({sort: 'dateline', sortOrder:'-1', limit:'3'}, function(result){
      if(resultHandler.process(result)){
        $scope.latestArticles = result.data;
      }
    });

  }]);

  app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "$anchorScroll", "userManager", "resultHandler", "confirm", "searchExchange", "notifications", function($scope, $resource, $state, $stateParams, $anchorScroll, userManager, resultHandler, confirm, searchExchange, notifications){
    var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
    var Picklist = $resource("api/picklists/:picklistId", {picklistId: "@picklistId"});
    var PicklistItem = $resource("api/picklistitems/:picklistitemId", {picklistitemId: "@picklistitemId"});
    var Git = $resource("system/git/:path", {path: "@path"});
    var Rating = $resource("api/ratings");
    var MyRating = $resource("api/ratings/rating/my");

    $scope.$on('searchResults', function(){
      $scope.senseOnline = true;
    });
    var defaultSelection;

    if($state.current.name=="projects.addedit"){
      if(!userManager.hasUser()){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            window.location = "#login?url=projects/new/edit"
          }
        });
      }
    }

    if(!userManager.canApprove('projects')){
      defaultSelection = {
        field: "approved",
        values: [0],
        lock: true
      }
    }
    $scope.$on("cleared", function(){
      searchExchange.init(defaultSelection);
    })

    $scope.pageSize = 20;

    $scope.onlyApproved = !userManager.canApprove('projects');

    $scope.userManager = userManager;
    $scope.Confirm = confirm;

    $scope.projects = [];
    $scope.gitProjects = [];
    $scope.url = "projects";

    $scope.searching = true;

    $scope.rating = {};
    $scope.getRate = {};
    $scope.query = {
      limit: $scope.pageSize
    };

    if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
      $scope.sort = $scope.sortOptions[$stateParams.sort];
    }

    if($stateParams.projectId){
      $scope.query.projectId = $stateParams.projectId;
      $scope.projectId = $stateParams.projectId;
    }

    $scope.ratingClick = function() {
      //$('#rating').css({'color': 'green', 'border':'0 none'})
      if($scope.rate && !$scope.isReadonly) {
        $scope.isReadonly = true;
        $scope.query.votenum = $scope.projects[0].votenum + 1
        $scope.query.votetotal = $scope.projects[0].votetotal + $scope.rate

        $scope.updateProjectData($scope.query)

        $scope.rating.id = $scope.projects[0]._id
        $scope.rating.userid = $stateParams.userId
        $scope.rating.rate = $scope.rate
        $scope.rating.date = new Date()

        var ratingquery = {
          entityId: $scope.rating.id,
          userid: $scope.rating.userid,
          createdate: $scope.rating.date,
          rating: $scope.rating.rate
        }

        $scope.saveRating(ratingquery)
      }
    };

    $scope.getMyRating= function(query) {
      // MyRating.save(query, function(result){
      //   if(resultHandler.process(result)) {
      //     if (result.total > 0 ) {
      //       $scope.isReadonly = true
      //       $scope.rate = result.data[0].rating
      //     } else {
      //       $scope.isReadonly = false
      //     }
      //   }
      // })
    }

    $scope.getPicklistItems = function(picklistName, out){
      Picklist.get({name: picklistName}, function(result){
        if(resultHandler.process(result)){
          if(result.data && result.data[0]){
            PicklistItem.get({picklistId: result.data[0]._id}, function(result){
              if(resultHandler.process(result)){
                $scope[out] = result.data;
              }
            });
          }
        }
      });
    };

    $scope.getPicklistItems("Product", "projectProducts", true);
    $scope.getPicklistItems("Category", "projectCategories", true);
    $scope.getPicklistItems("Project Status", "projectStatuses", true);

    $scope.getProductVersions = function(product){
      $scope.getPicklistItems(product.name + " Version", "productVersions");
    };

    $scope.getProjectData = function(query, append){
      Project.get(query, function(result){
        if(resultHandler.process(result)){
          if(append && append==true){
            $scope.projects = $scope.projects.concat(result.data);
          }
          else{
            $scope.projects = result.data;
            $scope.getRate.userid = $scope.userManager.userInfo._id;
            $scope.getRate.entityId = $scope.projects[0]._id

            $scope.getMyRating($scope.getRate)
            //if this is the detail view we'll update the breadcrumbs
            if($state.current.name == "projects.detail"){
              $scope.$root.$broadcast('spliceCrumb', {
                text: $scope.projects[0].title,
                link: "/projects/"+$scope.projects[0]._id
              });
            }
          }

          $scope.projects.forEach(function(item, index) {
            if (item.votenum > 0) {
              var length = Math.round(item.votetotal/item.votenum)
              $scope.projects[index].stars = new Array(length)
            }
          })

          $scope.projectInfo = result;
          delete $scope.projectInfo["data"];

          $scope.usegit = $scope.projects[0].git_clone_url!=null ? 'true' : 'false';
          $scope.getProductVersions($scope.projects[0].product);

        }
      });
    };

    $scope.getRating = function(total, count){
      if(count && count > 0){
        return Math.round(parseInt(total) / parseInt(count));
      }
      else{
        return 0;
      }
      };

    $scope.updateProjectData = function(query) {
      Project.save(query, function(result){
        if(resultHandler.process(result)) {

        }
      })
    }

    $scope.saveRating = function(rating) {
      Rating.save(rating, function(result) {
        if(resultHandler.process(result)) {

        }
      })
    }

    $scope.getBuffer = function(binary){
      return _arrayBufferToBase64(binary);
    };

    function _arrayBufferToBase64( buffer ) {
      var binary = '';
      var bytes = new Uint8Array( buffer );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return binary ;
    }

    $scope.getPageText = function(){
      if($scope.projects[0] && $scope.projects[0].content){
        return marked($scope.projects[0].content);
        //return $scope.projects[0].content;
      }
    };

    $scope.applySort = function(){
      window.location = "#projects?sort=" + $scope.sort.id + "&product=" + $scope.productId + "&category=" + $scope.categoryId;
    };

    $scope.getGitProjects = function(gituser, gitpassword){
      var creds = {
        user: gituser,
        password: gitpassword
      };
      Git.save({path:"projects"}, creds, function(result){
        if(resultHandler.process(result)){
          $scope.gitProjects = result.repos;
        }
      });
    };

    $scope.selectGitProject = function(project){
      $scope.newProjectGitProject = {
        repo: project.name,
        owner: project.owner.login
      };
    };

    $scope.previewThumbnail = function(){
      var file = $("#thumbnail")[0].files[0];
      var imageName = file.name;
      var imageType = file.type;
      var r = new FileReader();
      r.onloadend = function(event){
        var imageCanvas = document.createElement('canvas');
        var imageContext = imageCanvas.getContext('2d');
        var thumbnailCanvas = document.createElement('canvas');
        var thumbnailContext = thumbnailCanvas.getContext('2d');
        var thumbnail = new Image();
        thumbnail.onload = function() {
          var width = thumbnail.width;
          var height = thumbnail.height;
          imageCanvas.width = (width * (600/height));;
          imageCanvas.height = 600;
          thumbnailCanvas.width = (width * (77/height));
          thumbnailCanvas.height = 77;

          //draw the image and save the blob
          imageContext.drawImage(thumbnail, 0, 0, imageCanvas.width, imageCanvas.height);
          $scope.image = {
            type: imageType,
            name: imageName,
            data: imageCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
          }

          //draw the thumbnail and save the blob
          thumbnailContext.drawImage(thumbnail, 0, 0, thumbnailCanvas.width * (77/thumbnailCanvas.height), 77);
          $scope.thumbnail = {
            type: imageType,
            name: imageName,
            data: thumbnailCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
          }
          $scope.$apply(function(){
            $scope.newProjectThumbnail = thumbnailCanvas.toDataURL();
          });
        };
        thumbnail.src = r.result;
      }
      r.readAsDataURL(file);
    };

    $scope.validateNewProjectData = function(){
      //We're validating client side so that we don't keep passing image data back and forth
      //Some of these errors shouldnt occur becuase of the html5 'required' attribute but just in case...
      var errors = [];
      //Verify the project has a name
      if(!$scope.projects[0].title || $scope.projects[0].title==""){
        //add to validation error list
        errors.push("Please specify a Name");
      }
      //Make sure the product has been set
      if(!$scope.projects[0].product){
        //add to validation error list
        errors.push("Please select a Product");
      }
      //Make sure at least one version has been set
      if($scope.projects[0].product && $(".product-version:checkbox:checked").length==0){
        //add to validation error list
        errors.push("Please specify at least one Product Version");
      }
      //If git is being used make sure a project has been selected
      if($scope.usegit=='true' && !$scope.newProjectGitProject){
        //add to validation error list
        errors.push("Please select a Git project to use");
      }
      //If git is NOT being used make sure some content has been provided
      if($scope.usegit=='false' && !$("#newProjectContent").code()){
        //add to validation error list
        errors.push("Please add some content to the project (e.g. documentation, installation instructions).");
      }
      //If there are errors we need to notify the user
      if(errors.length > 0){
        //show the errors
        notifications.notify("The project could not be saved. Please review the following...", errors, {sentiment: "warning"});
      }
      else{
        //Save the record
        $scope.saveNewProject();
      }
    };

    $scope.saveNewProject = function(){
      var versions = [];
      $(".product-version:checkbox:checked").each(function(val, index){
        versions.push($(this).attr("data-versionid"));
        if(index==$(".product-version:checkbox:checked").length){
          $scope.projects[0].productversions = versions;
        }
      });
      if(!$scope.usegit || $scope.usegit=='false'){
        $scope.projects[0].content = $("#newProjectContent").code();
      }
      var data = {
        standard: $scope.projects[0],  //data that we can just assign to the project
        special:{ //that will be used to set additional properties
          image: $scope.image,
          thumbnail: $scope.thumbnail,
          gitProject: $scope.newProjectGitProject
        }
      }
      Project.save({}, data, function(result){
        if(resultHandler.process(result)){

        }
      });
    };

    $scope.search = function(){
      searchExchange.clear();
      $scope.searching = true;
    };

    $scope.browse = function(){
      searchExchange.clear();
      $scope.searching = false;
    };

    $scope.clear = function(){
      searchExchange.clear();
    };





    //only load the project if we have a valid projectId or we are in list view
    if(($state.current.name=="projects.detail" || $state.current.name=="projects.addedit") && $stateParams.projectId!="new"){
      $scope.getProjectData($scope.query); //get initial data set
    }
    else{ //user needs to be logged in so we redirect to the login page (this is a fail safe as techincally users shouldn't be able to get here without logging in)
      $("#newProjectContent").summernote();
      $scope.usegit = 'true';
      $scope.projects = [{}]; //add en empty object
    }

    function canvasToBlob(canvas, type){
      var byteString = atob(canvas.toDataURL().split(",")[1]),
          ab = new ArrayBuffer(byteString.length),
          ia = new Uint8Array(ab),
          i;

      for (i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ab], {
          type: type
      });
    }

    //this effectively initiates the results
    searchExchange.clear(true);

  }]);

  app.controller("blogController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "searchExchange", "picklistService", function($scope, $resource, $state, $stateParams, userManager, resultHandler, searchExchange, picklistService){
    var Blog = $resource("api/blogs/:blogId", {blogId: "@blogId"});
    $scope.pageSize = 20;
    $scope.query = {};

    var defaultSelection;

    if(!userManager.canApprove('blogs')){
      defaultSelection = {
        field: "approved",
        values: [0],
        lock: true
      }
    }
    $scope.$on("cleared", function(){
      searchExchange.init(defaultSelection);
    })

    searchExchange.clear(true);

    $scope.blogTypes;

    if($stateParams.blogId){
      $scope.query.blogId = $stateParams.blogId;
      $scope.blogId = $stateParams.blogId;
    }

    picklistService.getPicklistItems("Blog Type", function(items){
      $scope.blogTypes = items;
      $scope.newBlogType = items[0];
    });

    $scope.getBlogData = function(query, append){
      Blog.get(query, function(result){
        if(resultHandler.process(result)){
          if(append && append==true){
            $scope.blogs = $scope.blogs.concat(result.data);
          }
          else{
            $scope.blogs = result.data;
            //if this is the detail view we'll update the breadcrumbs
            if($state.current.name == "blogs.detail"){
              $scope.$root.$broadcast('spliceCrumb', {
                text: $scope.blogs[0].title,
                link: "/blogs/"+$scope.blogs[0]._id
              });
            }
          }
          $scope.blogInfo = result;
          delete $scope.blogInfo["data"];
        }
      });
    };

    if($scope.blogId == 'new'){
      $("#blogContent").summernote({
        height: 600
      });
    }
    else{
      $scope.getBlogData($scope.query);
    }

    $scope.previewThumbnail = function(){
      var file = $("#blogImage")[0].files[0];
      var imageName = file.name;
      var imageType = file.type;
      var r = new FileReader();
      r.onloadend = function(event){
        var imageCanvas = document.createElement('canvas');
        var imageContext = imageCanvas.getContext('2d');
        var thumbnail = new Image();
        thumbnail.onload = function() {
          var width = thumbnail.width;
          var height = thumbnail.height;
          imageCanvas.width = width;
          imageCanvas.height = Math.round(width / 4);


          //draw the image and save the blob
          imageContext.drawImage(thumbnail, 0, 0, imageCanvas.width, imageCanvas.height);
          $scope.image = {
            type: imageType,
            name: imageName,
            data: imageCanvas.toDataURL("image/png").replace(/^data:image\/(png|jpg);base64,/, "")
          }
          $scope.$apply(function(){
            $scope.newBlogImage = imageCanvas.toDataURL();
          });
        };
        thumbnail.src = r.result;
      }
      r.readAsDataURL(file);
    };

    $scope.validateNewBlogData = function(){
      $scope.saveBlog();
    };

    $scope.saveBlog = function(){
      var data = {
        standard:{
          title: $scope.newBlogTitle,
          content: $("#blogContent").code()
        },
        special:{
          image: $scope.image
        }
      };
      Blog.save({}, data, function(result){

      });
    };

    $scope.getBlogContent = function(text){
      if(text && text.data){
        var buffer = _arrayBufferToBase64(text.data);
        return marked(buffer);
      }
      else{
        return "";
      }
    };

    function _arrayBufferToBase64( buffer ) {
      var binary = '';
      var bytes = new Uint8Array( buffer );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return binary ;
    }
  }]);

  app.controller("commentController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
    var Comment = $resource("api/comments/:commentId", {commentId: "@commentId"});
    var Entity = $resource("api/"+$scope.entity+"/"+$scope.entityid+"/:path", {path: "@path"});

    $scope.userManager = userManager;

    $("#summernote").summernote({
      height: 100
    });

    $scope.comments = [];
    $scope.pageSize = 10;

    $scope.sortOptions = {
      newest: {
        id: "newest",
        name: "Newest",
        order: -1,
        field: "createdate"
      },
      oldest: {
        id: "oldest",
        name: "Oldest",
        order: 1,
        field: "createdate"
      }
    };

    $scope.getFlagged = function(){
      Comment.get({commentId: "flagged", entityId: $scope.entityid}, {
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

    $scope.getFlagged();

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

    $scope.commentQuery = {
      limit: $scope.pageSize //overrides the server side setting
    };

    $scope.applySort = function(sort){
      $scope.commentQuery.sort = sort.field;
      $scope.commentQuery.sortOrder = sort.order;
      $scope.getCommentData($scope.commentQuery);
    };

    $scope.sort = $scope.sortOptions.newest;
    $scope.commentQuery.sort = $scope.sort.field;
    $scope.commentQuery.sortOrder = $scope.sort.order;





    $scope.getCommentData = function(query, append){
      Comment.get(query, function(result){
        if(resultHandler.process(result, null, true)){
          if(append && append==true){
            $scope.comments = $scope.comments.concat(result.data);
          }
          else{
            $scope.comments = result.data;
          }
          $scope.commentInfo = result;
          delete $scope.commentInfo["data"];
        }
      });
    };

    if($scope.entityid){
      $scope.commentQuery.entityId = $scope.entityid;
      $scope.url = $scope.entity + "/" + $scope.entityId;
      $scope.getCommentData($scope.commentQuery);
    }

    $scope.getCommentText = function(text){
      if(text && text.data){
        var buffer = _arrayBufferToBase64(text.data);
        return marked(buffer);
      }
      else{
        return "";
      }
    }

    $scope.saveComment = function(){
      var commentText = $("#summernote").code();
      Comment.save({}, {
        entityId: $scope.entityid,
        content: commentText
      }, function(result){
        if(resultHandler.process(result)){
          $("#summernote").code("");
          //fetch the comments again to resolve any sorting/countnig issues
          $scope.getCommentData($scope.commentQuery);
        }
      })
    };

    $scope.more = function(){
      $scope.commentQuery.skip = $scope.comments.length;
      $scope.getCommentData($scope.commentQuery, true);
    };

    function bin2String(array) {
      return String.fromCharCode.apply(String, array);
    }

    function _arrayBufferToBase64( buffer ) {
      var binary = '';
      var bytes = new Uint8Array( buffer );
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return binary ;
    }


  }]);

  app.controller("userController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
    var User = $resource("api/users/:userId", {userId: "@userId"});
    var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});

    $scope.query = {};
    $scope.projectCount = 0;

    if($stateParams.userId){
      $scope.query.userId = $stateParams.userId;
      Project.get({projectId:'count', userid: $stateParams.userId}, function(result){
        if(resultHandler.process(result)){
          $scope.projectCount = result.count;
        }
      });

    }


    $scope.getUserData = function(query, append){
      User.get(query, function(result){
        if(resultHandler.process(result)){
          if(append && append==true){
            $scope.users = $scope.users.concat(result.data);
          }
          else{
            $scope.users = result.data;
          }
          $scope.userInfo = result;
          delete $scope.userInfo["data"];
        }
      });
    };

    $scope.getUserData($scope.query);

  }]);

  app.controller("moderationController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "confirm", function($scope, $resource, $state, $stateParams, userManager, resultHandler, confirm, title){
    var Entity = $resource("/api/"+$scope.entity+"/:entityId/:function", {entityId: "@entityId", function: "@function"});

    $scope.userManager = userManager;

    $scope.isApproved = function(){
      return $scope.approved == "True" || $scope.approved == true;
    };

    $scope.flagEntity = function(){
      //Need to implement new flagging functionality
      var fn = $scope.flagged==true ? "unflag" : "flag";
      Entity.save({entityId: $scope.entityid, function: fn}, function(result){
        if(resultHandler.process(result)){
          $scope.flagged = !$scope.flagged;
        }
      });
    };

    $scope.hideEntity = function(){
      Entity.save({entityId: $scope.entityid, function: "hide"}, function(result){
        if(resultHandler.process(result)){
          $scope.approved = "False";
        }
      });
    };

    $scope.approveEntity = function(){
      Entity.save({entityId: $scope.entityid, function: "approve"}, function(result){
        if(resultHandler.process(result)){
          $scope.approved = "True";
          //need to remove all flags for the project here
        }
      });
    };

    $scope.editEntity = function(){
      window.location = "#"+$scope.entity+"/"+$scope.entityid+"/edit";
    };

    $scope.deleteEntity = function(){
      confirm.prompt("Are you sure you want to delete the selected item", ["Yes", "No"], function(result){
        if(result==0){
          Entity.delete({entityId: $scope.entityid}, function(result){
              if(resultHandler.process(result)){
                window.location = "#"+$scope.entity;
              }
          });
        }
      });
    };
  }]);


})();

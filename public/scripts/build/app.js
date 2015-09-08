(function() {
  var app = angular.module("branch", ["ui.router", "ngResource", "ngNotificationsBar", "ngConfirm", "ngComments", "ngModeration", "ngSanitize", 'ui.bootstrap' ]);

  app.config(["$stateProvider","$urlRouterProvider", "notificationsConfigProvider", "confirmConfigProvider", "commentsConfigProvider", "moderationConfigProvider", function($stateProvider, $urlRouterProvider, notificationsConfigProvider, confirmConfigProvider, commentsConfig, moderationConfig) {
    $urlRouterProvider.otherwise("/");

    notificationsConfigProvider.setAutoHide(true);

    notificationsConfigProvider.setHideDelay(1500);

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
      url: "/loginsignup",
      templateUrl : "/views/loginsignup.html",
      controller: "authController",
      data: {
        crumb: "Login"
      }
    })
    //login page
    //used if a session has expired or user is not logged in and tries to navigate to a page that requires authentication
    .state("login", {
      url: "/login?url",
      templateUrl : "/views/login.html",
      controller: "authController",
      data: {
        crumb: "Login"
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
        link: "#projects"
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
              console.log(state);
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
          entityid: "="
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
  			restrict: "A",
  			scope:{
          entity: "=",
          entityid: "="
  			},
        templateUrl: "/views/moderation.html",
        link: function(scope){

        },
        controller: "moderationController"
      }
    }]);

  	return module;
  }));

  //services
  app.service('userManager', ['$resource', function($resource){
    var System = $resource("system/:path", {path: "@path"});
    this.menu = {};
    this.userInfo = {};
    var that = this;
    this.canUpdateAll = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].allOwners && this.userInfo.role.permissions[entity].allOwners==true;
    }
    this.canCreate = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].create && this.userInfo.role.permissions[entity].create==true;
    }
    this.canRead = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].read && this.userInfo.role.permissions[entity].read==true;
    }
    this.canUpdate = function(entity){
      return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].update && this.userInfo.role.permissions[entity].update==true;
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
    this.refresh = function(){
      System.get({path:'userInfo'}, function(result){
        that.menu = result.menu;
        that.userInfo = result.user;
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
        console.log(result.errText);
        notifications.showError({
          message: result.errText,
          hideDelay: 3000,
          hide: true
        });
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

  //controllers
  app.controller("adminController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
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
      "picklistitems"
    ];

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

      if(index==2){
        //if the feature entities haven't been loaded get the first page of data
        //PROJECTS
        if(!$scope.projects || $scope.projects.length==0){
          Project.get({}, function(result){
            if(resultHandler.process(result)){
              $scope.projects = result.data;
              $scope.projectInfo = result;
              delete $scope.projectInfo["data"];
            }
          })
        }
        //ARTICLES
        if(!$scope.articles || $scope.articles.length==0){
          Article.get({}, function(result){
            if(resultHandler.process(result)){
              $scope.articles = result.data;
              $scope.articleInfo = result;
              delete $scope.articleInfo["data"];
            }
          })
        }
      }
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

    $scope.setFeature = function(id){
      if($scope.features[$scope.activeFeature].name=="project"){
        Feature.save({featureId: $scope.features[$scope.activeFeature]._id }, {entityId: id}, function(result){
          resultHandler.process(result);
        });
      }
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

  app.controller("authController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
    var Login = $resource("auth/login");
    var Signup = $resource("auth/signup");
    var Reset = $resource("auth/reset")

    if($stateParams.url){
      $scope.returnUrl = $stateParams.url;
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
      });
    };

    $scope.signup = function(){
      Signup.save({
        username: $scope.username,
        password: $scope.password,
        email: $scope.email
      }, function(result) {
        if (resultHandler.process(result)) {

        }
      })
    };

    $scope.reset = function() {
      Reset.save({
        email: $scope.email2
      }, function(result) {
        if (resultHandler.process(result)) {
          
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

  app.controller("projectController", ["$scope", "$resource", "$state", "$stateParams", "$anchorScroll", "userManager", "resultHandler", "confirm", function($scope, $resource, $state, $stateParams, $anchorScroll, userManager, resultHandler, confirm, title){
    var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
    var Picklist = $resource("api/picklists/:picklistId", {picklistId: "@picklistId"});
    var PicklistItem = $resource("api/picklistitems/:picklistitemId", {picklistitemId: "@picklistitemId"});
    var Git = $resource("system/git/:path", {path: "@path"});

    $scope.userManager = userManager;
    $scope.Confirm = confirm;

    $scope.projects = [];
    $scope.gitProjects = [];
    $scope.url = "projects";

    $scope.stars = new Array(5);

    console.log('params - ',$stateParams);

    $scope.sortOptions = {
      createdate: {
        id: "createdate",
        name: "Last Updated",
        order: -1,
        field: "createdate"
      },
      rating:{
        id: "rating",
        name: "Highest Rated",
        order: [-1,-1],
        field:["votenum", "votetotal"]
      },
      lastpost: {
        id: "lastpost",
        name: "Most recent comments",
        order: -1,
        field: "lastpost"
      },
      title: {
        id: "title",
        name: "A-Z",
        order: 1,
        field: "title"
      }
    };

    $scope.sort = $scope.sortOptions.createdate;
    $scope.categoryId = "";
    $scope.productId = "";

    $scope.query = {

    };
    if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
      $scope.sort = $scope.sortOptions[$stateParams.sort];
    }
    $scope.query.sort = $scope.sort.field;
    $scope.query.sortOrder = $scope.sort.order;
    if($stateParams.projectId){
      $scope.query.projectId = $stateParams.projectId;
      $scope.projectId = $stateParams.projectId;
    }
    if($stateParams.product){
      $scope.productId = $stateParams.product;
      $scope.query.product = $stateParams.product;
    }
    if($stateParams.category){
      $scope.categoryId = $stateParams.category;
      $scope.query.category = $stateParams.category;
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

    // Category.get({}, function(result){
    //   if(resultHandler.process(result)){
    //     $scope.projectCategories = result.data;
    //     $scope.projectCategoryInfo = result;
    //     delete $scope.projectCategoryInfo["data"];
    //   }
    // });

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
            //if this is the detail view we'll update the breadcrumbs
            if($state.current.name == "projects.detail"){
              $scope.$root.$broadcast('spliceCrumb', {
                text: $scope.projects[0].title,
                link: "/projects/"+$scope.projects[0]._id
              });
            }
          }
          $scope.projectInfo = result;
          delete $scope.projectInfo["data"];
          console.log($scope.projectInfo);
        }
      });
    };

    $scope.getMore = function(){
      var query = $scope.projectInfo.query;
      query.limit = $scope.projectInfo.limit;
      query.skip = $scope.projectInfo.skip;
      query.sort = $scope.sort.field;
      query.sortOrder = $scope.sort.order;
      $scope.getProjectData(query, true);
    };

    $scope.getRating = function(total, count){
      if(count && count > 0){
        return Math.round(parseInt(total) / parseInt(count));
      }
      else{
        return 0;
      }
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

    $scope.flagProject = function(project){
      Project.save({projectId:project._id, function: "flag"}, function(result){
        if(resultHandler.process(result)){
          project.flagged = true;
        }
      });
    };

    $scope.hideProject = function(project){
      Project.save({projectId:project._id, function: "hide"}, function(result){
        if(resultHandler.process(result)){
          project.approved = false;
        }
      });
    };

    $scope.approveProject = function(project){
      Project.save({projectId:project._id, function: "approve"}, function(result){
        if(resultHandler.process(result)){
          project.approved = true;
          project.flagged = false;
        }
      });
    };

    $scope.deleteProject = function(project, index){
      $scope.Confirm.prompt("Are you sure you want to delete the project "+project.title, ["Yes", "No"], function(result){
        if(result==0){
          if($stateParams.projectId){
            window.location = "#projects";
          }
          else {
            Project.delete({projectId: project._id}, function(result){
                if(resultHandler.process(result)){
                  $scope.projects.splice(index, 1);
                }
            });
          }
        }
      });
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
      console.log(project);
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
      var errors = [];
      //Verify the project has a name
      if(!$scope.newProjectName || $scope.newProjectName==""){
        //add to validation error list
        errors.push({});
      }
      //Make sure the product has been set
      if(!$scope.newProjectProduct){
        //add to validation error list
        errors.push({});
      }
      //Make sure at least one version has been set
      if($scope.newProjectProduct && $(".product-version").length==0){
        //add to validation error list
        errors.push({});
      }
      //If git is being used make sure a project has been selected
      if($scope.usegit=='true' && !$scope.newProjectGitProject){
        //add to validation error list
        errors.push({});
      }
      //If git is NOT being used make sure some content has been provided
      if($scope.usegit=='false' && !$("#newProjectContent").code()){
        //add to validation error list
        errors.push({});
      }
      //If there are errors we need to notify the user
      if(errors.length > 0){
        //show the errors
      }
      else{
        //Save the record
        $scope.saveNewProject();
      }
    };

    $scope.saveNewProject = function(){
      var data = {
        standard:{  //data that we can just assign to the project
          title: $scope.newProjectName,
          short_description: $scope.newProjectDescription,
          product: $scope.newProjectProduct,
          category: $scope.newProjectCategory
        },
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

    //only load the project if we have a valid projectId or we are in list view
    if(($state.current.name=="projects.detail" && $stateParams.projectId!="new") || $state.current.name=="projects"){
      $scope.getProjectData($scope.query); //get initial data set
    }
    else{ //user needs to be logged in so we redirect to the login page (this is a fail safe as techincally users shouldn't be able to get here without logging in)
      $("#newProjectContent").summernote();
      $scope.usegit = 'true';
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
  }]);

  app.controller("commentController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", function($scope, $resource, $state, $stateParams, userManager, resultHandler){
    var Comment = $resource("api/comments/:commentId", {commentId: "@commentId"});

    $("#summernote").summernote();

    $scope.comments = [];
    $scope.pageSize = 10;

    console.log($scope.entityid);

    $scope.$watch("entityid", function(newVal, oldVal){
      console.log('changed to' + newVal);
      console.log('changed from' + oldVal);
    });

    $scope.sortOptions = {
      newest: {
        id: "newest",
        name: "Newest",
        order: -1,
        field: "dateline"
      },
      oldest: {
        id: "oldest",
        name: "Oldest",
        order: 1,
        field: "dateline"
      }
    };

    $scope.commentQuery = {
      limit: $scope.pageSize //overrides the server side setting
    };

    $scope.sort = $scope.sortOptions.newest;

    if($stateParams.page){
      $scope.commentQuery.skip = ($stateParams.page-1) * $scope.pageSize;
    }
    if($stateParams.sort && $scope.sortOptions[$stateParams.sort]){
      $scope.sort = $scope.sortOptions[$stateParams.sort];
      $scope.commentQuery.sort = $scope.sort.field;
      $scope.commentQuery.sortOrder = $scope.sort.order;
    }

    $scope.getCommentData = function(query){
      Comment.get(query, function(result){
        if(resultHandler.process(result, null, true)){
          $scope.comments = result.data;
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
      var buffer = _arrayBufferToBase64(text.data);
      return marked(buffer);
    }

    $scope.saveComment = function(){
      var commentText = $("#summernote").code();
      Comment.save({}, {
        entityId: $scope.entityid,
        pagetext: commentText,
        commenttext: commentText
      }, function(result){
        if(resultHandler.process(result)){
          $scope.comments.push(result);
        }
      })
    }

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
    $scope.userManager = userManager;
  }]);


})();

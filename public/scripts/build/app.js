(function() {
  var app = angular.module("branch", ["ui.router", "ngResource", "ngNotificationsBar", "ngSanitize"]);

  app.config(["$stateProvider","$urlRouterProvider", "notificationsConfigProvider", function($stateProvider, $urlRouterProvider, notificationsConfigProvider) {
    $urlRouterProvider.otherwise("/");

    notificationsConfigProvider.setAutoHide(true);

    notificationsConfigProvider.setHideDelay(1500);

    $stateProvider
    //home page
    .state("home", {
      url: "/",
      templateUrl: "/views/home/index.html",
      controller: "homeController"
    })
    //login and signup page
    .state("loginsignup", {
      url: "/loginsignup",
      templateUrl : "/views/loginsignup.html"
    })
    //login page
    //used if a session has expired or user is not logged in and tries to navigate to a page that requires authentication
    .state("login", {
      url: "/login",
      templateUrl : "/views/login.html"
    })
    //used to navigate to the admin console
    .state("admin", {
      url: "/admin",
      templateUrl: "/views/admin/index.html",
      controller: "adminController"
    })
  }]);

  //services
  app.service('userPermissions', ['$resource', function($resource){
    var System = $resource("system/:path", {path: "@path"});
    this.permissions = {};
    var that = this;
    this.canCreate = function(entity){
      return this.permissions[entity] && this.permissions[entity].create && this.permissions[entity].create==true
    }
    this.canRead = function(entity){
      console.log(entity);
      return this.permissions[entity] && this.permissions[entity].read && this.permissions[entity].read==true
    }
    this.canUpdate = function(entity){
      return this.permissions[entity] && this.permissions[entity].update && this.permissions[entity].update==true
    }
    this.canDelete = function(entity){
      return
      (this.permissions[entity] && this.permissions[entity].softDelete && this.permissions[entity].softDelete==true)
      ||
      (this.permissions[entity] && this.permissions[entity].hardDelete && this.permissions[entity].hardDelete==true)
    }
    this.canSeeAll = function(entity){
      return this.permissions[entity] && this.permissions[entity].allOwners && this.permissions[entity].allOwners==true
    }
    this.canApprove = function(entity){
      return this.permissions[entity] && this.permissions[entity].approve && this.permissions[entity].approve==true
    }
    this.refresh = function(){
      System.get({path:'userpermissions'}, function(result){
        that.permissions = result;
      });
    }
    this.refresh();
  }]);

  app.service('resultHandler', ["notifications", function(notifications){
    this.process = function(result, action){   //deals with the result in a generic way. Return true if the result is a success otherwise returns false
      if(result.redirect){
        window.location = result.redirect;
        return false;
      }
      else if (result.errCode) {
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
  app.controller("adminController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
    var User = $resource("api/users/:userId", {userId: "@userId"});
    var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
    var Article = $resource("api/articles/:articleId", {articleId: "@articleId"});
    var UserRoles = $resource("api/userroles/:roleId", {roleId: "@roleId"});
    var Feature = $resource("api/features/:featureId", {featureId: "@featureId"});

    $scope.permissions = userPermissions;

    $scope.collections = [
      "users",
      "userroles",
      "features",
      "projects"
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
        $scope.setFeature(0);
      }
    });

    $scope.activeRole = 0;

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
        // if(!$scope.articles || $scope.articles.length==0){
        //   Article.get({}, function(result){
        //     if(resultHandler.process(result)){
        //       $scope.articles = result.data;
        //       $scope.articleInfo = result;
        //       delete $scope.articleInfo["data"];
        //     }
        //   })
        // }
      }
    };

    $scope.setRole = function(index){
      $scope.activeRole = index;
      $scope.copyRoleName = $scope.roles[$scope.activeRole].name;
    };

    $scope.setFeature = function(index){
      $scope.activeFeature = index;
    };

    $scope.saveRole = function(){
      console.log($scope.roles[$scope.activeRole]);
      UserRoles.save({roleId:$scope.roles[$scope.activeRole]._id}, $scope.roles[$scope.activeRole], function(result){
        if(resultHandler.process(result, "Save")){
          $scope.permissions.refresh();
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

    $scope.highlightRow = function(id){
      if($scope.features[$scope.activeFeature].entityId==id){
        return true;
      }
      return false;
    }
  }]);

  app.controller("homeController", ["$scope", "$resource", "$state", "$stateParams", "userPermissions", "resultHandler", function($scope, $resource, $state, $stateParams, userPermissions, resultHandler){
    var Feature = $resource("api/features/:featureId", {featureId: "@featureId"});
    var Project = $resource("api/projects/:projectId", {projectId: "@projectId"});
    var Article = $resource("api/articles/:articleId", {articleId: "@articleId"});

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
              Project.get({projectId: entityId}, function(result){
                if(resultHandler.process(result)){
                  $scope.featuredProject = result.data[0];
                }
              });
              break;
          }
        }
      }
    });

  }]);

})();

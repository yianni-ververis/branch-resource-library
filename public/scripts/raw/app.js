(function() {
  var app = angular.module("branch", ["ui.router", "ngResource", "ngNotificationsBar", "ngPaging", "ngSanitize" ]);

  app.config(["$stateProvider","$urlRouterProvider", "notificationsConfigProvider", "pagingConfigProvider", function($stateProvider, $urlRouterProvider, notificationsConfigProvider, pagingConfigProvider) {
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
    //used to navigate to the project list page
    .state("projects", {
      url: "/projects?sort&category&product",
      templateUrl: "/views/projects/index.html",
      controller: "projectController"
    })
    //used to navigate to a given project detail page
    .state("projects.detail", {
      url: "/:projectId",
      views: {
          "@":{
            templateUrl: "/views/projects/detail.html",
            controller: "projectController"
          }
        }
    })
    //used to navigate to a user list page (not currently used)
    .state("users", {
      url: "/users?sort",
      templateUrl: "/views/users/index.html",
      controller: "userController"
    })
    //used to navigate to a given project detail page
    .state("users.detail", {
      url: "/:userId",
      views: {
          "@":{
            templateUrl: "/views/users/detail.html",
            controller: "userController"
          }
        }
    })
  }]);

  //directives
  include "./directives/paging.js"
  //services
  include "./services/permissions.js"
  include "./services/result-handler.js"
  //controllers
  include "./controllers/admin.js"
  include "./controllers/home.js"
  include "./controllers/project.js"
  include "./controllers/comment.js"
  include "./controllers/user.js"

})();

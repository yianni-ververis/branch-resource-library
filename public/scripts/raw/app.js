(function() {
  var app = angular.module("branch", ["ui.router", "ngResource", "ngNotificationsBar", "ngConfirm", "ngSanitize" ]);

  app.config(["$stateProvider","$urlRouterProvider", "notificationsConfigProvider", "confirmConfigProvider", function($stateProvider, $urlRouterProvider, notificationsConfigProvider, confirmConfigProvider) {
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
        crumb: ""
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
  include "./directives/header.js"
  include "./directives/confirm-dialog.js"
  //services
  include "./services/user-manager.js"
  include "./services/result-handler.js"
  //controllers
  include "./controllers/admin.js"
  include "./controllers/auth.js"
  include "./controllers/home.js"
  include "./controllers/project.js"
  include "./controllers/comment.js"
  include "./controllers/user.js"

})();

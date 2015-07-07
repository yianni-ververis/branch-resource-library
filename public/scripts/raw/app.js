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
    //used to navigate to the project list page
    .state("projects", {
      url: "/projects?page&sort",
      templateUrl: "/views/projects/index.html",
      controller: "projectController"
    })
    //used to navigate to a given project list page
    .state("projects.list.page", {
      url: "/projects/list?page",
      templateUrl: "/views/projects/index.html",
      controller: "projectController"
    })
  }]);

  //services
  include "./services/permissions.js"
  include "./services/result-handler.js"
  //controllers
  include "./controllers/admin.js"
  include "./controllers/home.js"
  include "./controllers/project.js"
})();

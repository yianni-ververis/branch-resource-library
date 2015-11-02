//(function() {
  var app = angular.module("branch", ["ui.router", "ngResource", "ngConfirm", "ngNotifications", "ngComments", "ngModeration", "ngRating", "ngSubscribe", "ngSanitize", "visualCaptcha" ]);

  app.config(["$stateProvider","$urlRouterProvider", "confirmConfigProvider", "notificationConfigProvider", "commentsConfigProvider", "moderationConfigProvider", "ratingConfigProvider", "subscribeConfigProvider", function($stateProvider, $urlRouterProvider, notificationsConfigProvider, confirmConfigProvider, commentsConfig, moderationConfig, ratingConfig, subscribeConfig) {
    $urlRouterProvider.otherwise("/");

    $stateProvider
    //home page
    .state("home", {
      url: "/",
      templateUrl: "/views/home/index.html",
      controller: "homeController"
    })
    //login and signup page
    .state("loginsignup", {
      url: "/loginsignup?url",
      templateUrl : "/views/loginsignup.html",
      controller: "authController"
    })
    //login page
    //used if a session has expired or user is not logged in and tries to navigate to a page that requires authentication
    .state("login", {
      url: "/login?url",
      templateUrl : "/views/login.html",
      controller: "authController"
    })
    //password reset page
    //used if a session has expired or user is not logged in and tries to navigate to a page that requires authentication
    .state("reset", {
      url: "/reset",
      templateUrl : "/views/reset.html",
      controller: "authController"
    })
    //used to navigate to the admin console
    .state("admin", {
      url: "/admin",
      templateUrl: "/views/admin/index.html",
      controller: "adminController"
    })
    //used to navigate to the project list page
    .state("projects", {
      url: "/project?terms&page&sort",
      templateUrl: "/views/projects/index.html",
      controller: "projectController"
    })
    //used to navigate to a given project detail page
    .state("projects.detail", {
      url: "/:projectId?status",
      views:{
        "@":{
          templateUrl: "/views/projects/detail.html",
          controller: "projectController",
        }
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
      }
    })
    //used to navigate to the blog list page
    .state("blogs", {
      url: "/blog",
      templateUrl: "/views/blogs/index.html",
      controller: "blogController"
    })
    //used to navigate to a given blog detail page
    .state("blogs.detail", {
      url: "/:blogId?status",
      views:{
        "@":{
          templateUrl: "/views/blogs/detail.html",
          controller: "blogController",
        }
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
      }
    })
    //used to navigate to a user list page (not currently used)
    .state("users", {
      url: "/user?sort",
      templateUrl: "/views/users/index.html",
      controller: "userController"
    })
    //used to allow users to change their password
    .state("users.changepassword", {
      url: "/changepassword",
      views:{
        "@":{
          templateUrl: "/views/users/changepassword.html",
          controller: "userController",
        }
      }
    })
    //used to navigate to a given user detail page
    .state("users.detail", {
      url: "/:userId",
      views:{
        "@":{
          templateUrl: "/views/users/detail.html",
          controller: "userController",
        }
      }
    })
    //used to navigate to a given user add/edit page
    .state("users.addedit", {
      url: "/:userId/edit",
      views:{
        "@":{
          templateUrl: "/views/users/addedit.html",
          controller: "userController",
        }
      }
    })
    //used to navigate to a user list page (not currently used)
    .state("userprofiles", {
      url: "/userprofile?sort",
      templateUrl: "/views/users/index.html",
      controller: "userController"
    })
    //used to navigate to a given user add/edit page
    .state("userprofiles.addedit", {
      url: "/:userId/edit",
      views:{
        "@":{
          templateUrl: "/views/users/addedit.html",
          controller: "userController",
        }
      }
    })
  }]);

  // //directives
  // include "./directives/header.js"
  // include "./directives/confirm-dialog.js"
  // include "./directives/notification-dialog.js"
  // include "./directives/comments.js"
  // include "./directives/moderation.js"
  // include "./directives/rating.js"
  // include "./directives/subscribe.js"
  // include "./directives/search-input.js"
  // include "./directives/search-filter.js"
  // include "./directives/search-results.js"
  // //services
  // include "./services/user-manager.js"
  // include "./services/result-handler.js"
  // include "./services/search-exchange.js"
  // include "./services/picklists.js"
  // include "./services/publisher.js"
  // //controllers
  // include "./controllers/admin.js"
  // include "./controllers/auth.js"
  // include "./controllers/home.js"
  // include "./controllers/project.js"
  // include "./controllers/blog.js"
  // include "./controllers/comment.js"
  // include "./controllers/user.js"
  // include "./controllers/moderation.js"

//  return app

//})();

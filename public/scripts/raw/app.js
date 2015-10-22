//(function() {
  var app = angular.module("branch", ["ui.router", "ngResource", "ngConfirm", "ngNotifications", "ngComments", "ngModeration", "ngRating", "ngSanitize", "visualCaptcha" ]);

  app.config(["$stateProvider","$urlRouterProvider", "confirmConfigProvider", "notificationConfigProvider", "commentsConfigProvider", "moderationConfigProvider", "ratingConfigProvider", function($stateProvider, $urlRouterProvider, notificationsConfigProvider, confirmConfigProvider, commentsConfig, moderationConfig, ratingConfig) {
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
      url: "/:projectId?status",
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
    //used to allow users to change their password
    .state("users.changepassword", {
      url: "/changepassword",
      views:{
        "@":{
          templateUrl: "/views/users/changepassword.html",
          controller: "userController",
        }
      },
      data: {
        crumb: "Change Password"
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
      },
      data: {
        crumb: "Detail"
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
  // include "./directives/search-input.js"
  // include "./directives/search-filter.js"
  // include "./directives/search-results.js"
  // //services
  // include "./services/user-manager.js"
  // include "./services/result-handler.js"
  // include "./services/search-exchange.js"
  // include "./services/picklists.js"
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

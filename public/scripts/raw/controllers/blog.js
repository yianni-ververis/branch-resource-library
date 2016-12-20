app.controller("blogController", ["$sce", "$rootScope", "$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "picklistService", function ($sce, $rootScope, $scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, picklistService) {
  var Blog = $resource("api/blog/:blogId", { blogId: "@blogId" });
  $scope.pageSize = 20;
  $scope.query = {};

  var defaultSelection;

  $rootScope.headTitle = "Blog: Qlik Branch";
  $rootScope.metaKeys = "Branch, Qlik Branch, Blog, Articles, Updates, News, Qlik Sense, Qlik, Open Source";
  $rootScope.metaDesc = "The Qlik Branch Blog is a place for developers to read helpful and interesting articles about using our APIs as well as news and communications about anything relevant to developers."
  $rootScope.metaImage = "http://branch.qlik.com/resources/branch_logo.png";

  if ($stateParams.blogId) {
    $scope.query.blogId = $stateParams.blogId;
  }

  $scope.getBlogData = function (query, append) {
    Blog.get(query, function (result) {
      $scope.blogLoading = false;
      if (resultHandler.process(result)) {
        if (result.link) {
          window.location = result.link
        }
        else {
          window.location = "#!noitem";
        }
      }
    });
  };

  $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    if ($state.current.name == "blogs.redirect") {
      $scope.getBlogData($scope.query); //get initial data set
    } else {
      if (fromState.name.split(".")[0] == toState.name.split(".")[0]) { //then we should clear the search state
        if (toState.name.split(".").length == 1) { //we only need to do this if we're on a listing page
          searchExchange.publish("executeSearch");
        }
      }
      if (toState.name != "loginsignup") {
        searchExchange.view = toState.name.split(".")[0];
      }
      if ((fromState.name.split(".")[0] != toState.name.split(".")[0]) || fromState.name == "loginsignup") {
        searchExchange.clear(true);
      }
      defaultSelection = [];
      searchExchange.subscribe('reset', "blogs", function () {
        searchExchange.init(defaultSelection);
        searchExchange.unsubscribe('reset', "blogs");
      });
      if ((fromState.name.split(".")[0] != toState.name.split(".")[0]) || fromState.name == "loginsignup") {
        searchExchange.clear(true);
      }
    }
  });

}]);

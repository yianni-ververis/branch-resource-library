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
	var module = angular.module('ngRating', []);
  module.provider('ratingConfig', function() {
    return {
			$get: function(){
				return {}
			}
		};
  });

  module.factory('rating', ['$rootScope', function ($rootScope) {
		return {

		};
  }]);

  module.directive('rating', ['ratingConfig', '$resource', '$timeout', 'resultHandler', function (confirmConfig, $resource, $timeout, resultHandler) {
    return {
			restrict: "E",
			replace: true,
			scope:{
        entity: "=",
        entityid: "=",
				user: "="
			},
      templateUrl: "/views/rating.html",
      link: function(scope){
        var Rating = $resource("/api/ratings/:ratingId", {ratingId: "@ratingId"});

        scope.$watch('user', function(newVal, oldVal){
          if(scope.user && scope.entityid){
            scope.getRating();
          }
        });

        scope.$watch('entityid', function(newVal, oldVal){
          if(scope.user && scope.entityid){
            scope.getRating();
          }
        });

        scope.displayStar = -1;
        scope.stars = {
          "0": -2,
          "1": -1,
          "2": 1,
          "3": 2,
          "4": 3
        };

        scope.setDisplayStar = function(index){
          scope.displayStar = index;
        };
        scope.clearDisplayStar = function(){
          scope.displayStar = -1;
        };

        scope.getRating = function(){
          Rating.get({entityId: scope.entityid, userid: scope.user}, function(result){
            if(resultHandler.process(result)){
              scope.myRating = result.data[0];
            }
          });
        };
      }
    }
  }]);

	return module;
}));

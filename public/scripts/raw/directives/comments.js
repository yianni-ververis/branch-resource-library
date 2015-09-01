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

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
	var module = angular.module('ngNotifications', []);
  module.provider('notificationConfig', function() {
    return {
			$get: function(){
				return {}
			}
		};
  });

  module.factory('notifications', ['$rootScope', function ($rootScope) {
		return {
			notify: function(message, list, options){
				$rootScope.$broadcast('notify', {message: message, list: list, options: options});
			}
		};
  }]);


  module.directive('notificationDialog', ['notificationConfig', '$timeout', function (confirmConfig, $timeout) {
    return {
			restrict: "E",
			scope:{

			},
      template: function(elem, attr){
        html = "<div class='notifications' ng-class='{active:active==true}'>";
	      html += "</div>";
				return html;
      },
      link: function(scope){
				scope.$on('notify', function(event, data){
          scope.message = data.message;
					scope.list = data.list;
					scope.options = data.options;
        });
      }
    }
  }]);

	return module;
}));

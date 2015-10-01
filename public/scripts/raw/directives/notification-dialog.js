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
        html = "<div ng-show='showing' ng-class='{\'positive\': options.sentiment==\'positive\', \'negative\': options.sentiment==\'negative\'}' class='notifications'>";
				html += "<p>{{message}}</p>";
				html += "<ul ng-if='list.length>0'>";
				html += "<li ng-repeat='item in list'>";
				html += "{{item}}"
				html += "<li>";
				html += "</ul>";
	      html += "</div>";
				return html;
      },
      link: function(scope){
				scope.$on('notify', function(event, data){
					scope.showing = true;
          scope.message = data.message || "";
					scope.list = data.list || [];
					scope.options = data.options || {};
        });
      }
    }
  }]);

	return module;
}));

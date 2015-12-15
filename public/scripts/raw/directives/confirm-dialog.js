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
	var module = angular.module('ngConfirm', []);
  module.provider('confirmConfig', function() {
    return {
			$get: function(){
				return {}
			}
		};
  });

  module.factory('confirm', ['$rootScope', function ($rootScope) {
		return {
			prompt: function(message, options, callbackFn){
				$rootScope.$broadcast('confirmPrompt', {message: message, options: options, callbackFn: callbackFn});
			}
		};
  }]);


  module.directive('confirmDialog', ['confirmConfig', '$timeout', function (confirmConfig, $timeout) {
    return {
			restrict: "E",
			scope:{

			},
      template: function(elem, attr){
        html = "<div class='confirm-smokescreen' ng-class='{active:active==true, wide:options.requireComment==true}'>";
        html += "<div class='confirm-dialog'>";
        html += "<p>{{message}}</p>";
				html += "<textarea class='form-control' ng-model='comment' ng-if='options.requireComment'></textarea>";
        html += "<ul>";
        html += "<li ng-repeat='option in options.options'><button class='branch-button' ng-click='returnOption($index)'>{{option}}</button></li>";
        html += "</ul>";
        html += "</div>";
	      html += "</div>";
				return html;
      },
      controller: ['$scope', function(scope){
				scope.$on('confirmPrompt', function(event, data){
          scope.message = data.message;
          scope.options = data.options;
          scope.callback = data.callbackFn;
          scope.active = true;
        });
        scope.returnOption = function(index){
					var comment = $(".confirm-dialog textarea").val();
					scope.message = null;
          scope.options = null;
          scope.active = false;
					scope.callback.call(null, {result: index, comment: comment});
          //scope.callback = null;
        };
      }]
    }
  }]);

	return module;
}));

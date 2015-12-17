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
	var module = angular.module('ngSubscribe', []);
  module.provider('subscribeConfig', function() {
    return {
			$get: function(){
				return {}
			}
		};
  });

  module.factory('subscribe', ['$rootScope', function ($rootScope) {
		return {

		};
  }]);

  module.directive('subscribe', ['subscribeConfig', '$resource', '$timeout', 'resultHandler', 'notifications', function (subscribeConfig, $resource, $timeout, resultHandler, notifications) {
    return {
			restrict: "E",
			replace: true,
			scope:{
        entity: "=",
        entityid: "=",
				user: "="
			},
      template: function(elem, attr){
        var html = "<button class='button-outline' ng-show='user' ng-click='toggleSubscription()' ng-disabled='{{subscribing==true}}'><i class='fa fa-envelope-o'></i>{{buttonText}}</button>";
        return html;
      },
      controller: ['$scope', function(scope){
        scope.buttonText = "Please wait...";
        var Subscribe = $resource("/api/subscription/:subId", {subId: "@subId"});

        scope.$watch('user', function(newVal, oldVal){
          if(scope.user && scope.entityid){
            scope.setup();
          }
        });

        scope.$watch('entityid', function(newVal, oldVal){
          if(scope.user && scope.entityid){
            scope.setup();
          }
        });

        scope.setup = function(){
          Subscribe.get({entityId: scope.entityid, userid: scope.user}, function(result){
            if(resultHandler.process(result)){
              scope.subscription = result.data[0];
              if(scope.subscription){
                scope.buttonText = "Unsubscribe";
              }
              else{
                scope.buttonText = "Subscribe";
              }
            }
          });
        };

        scope.toggleSubscription = function(){
					scope.subscribing=true;
					if(scope.subscription){
						Subscribe.delete({subId: scope.subscription._id}, function(result){
							scope.subscribing=false;
							if(resultHandler.process(result)){
								notifications.notify("You have successfully unsubscribed.", null, {sentiment:"positive"});
								scope.buttonText = "Subscribe";
							}else{
								notifications.notify(result.errText, null, {sentiment:"negative"});
							}
						});
					}
					else{
						Subscribe.save({entityId: scope.entityid, userid: scope.user}, function(result){
							scope.subscribing=false;
							if(resultHandler.process(result)){
								scope.subscription = result;
								notifications.notify("You have successfully subscribed.", null, {sentiment:"positive"});
								scope.buttonText = "Unsubscribe";
							}else{
								notifications.notify(result.errText, null, {sentiment:"negative"});
							}
						});
					}
        };

      }]
    }
  }]);

	return module;
}));

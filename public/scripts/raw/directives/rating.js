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

  module.factory('rating', ['$root$scope', function ($root$scope) {
		return {

		};
  }]);

  module.directive('rating', ['ratingConfig', '$resource', '$timeout', 'resultHandler', function (resultConfig, $resource, $timeout, resultHandler) {
    return {
			restrict: "E",
			replace: true,
			scope:{
        entity: "=",
        entityid: "=",
				user: "=",
        mode: "=",
        displaystar: "=?"
			},
      templateUrl: "/views/rating.html",
      controller: ['$scope', function($scope){
        var Rating = $resource("/api/rating/:ratingId", {ratingId: "@ratingId"});

        $scope.$watch('user', function(newVal, oldVal){
          if($scope.user && $scope.entityid && $scope.mode!='static'){
            $scope.getRating();
          }
        });

        $scope.$watch('entityid', function(newVal, oldVal){
          if($scope.user && $scope.entityid && $scope.mode!='static'){
            $scope.getRating();
          }
        });

        $scope.stars = [1,2,3,4,5];

        $scope.displayStar;
        $scope.pointsMap = {
          "1": -2,
          "2": -1,
          "3": 1,
          "4": 2,
          "5": 3
        };

        $scope.getStar = function(){
          if($scope.displaystar){
            return Math.round($scope.displaystar);
          }
          else if ($scope.myRating && $scope.myRating.rating) {
            return Math.round($scope.myRating.rating);
          }
          else{
            return null;
          }
        };

        $scope.setDisplayStar = function(star){
          if($scope.mode=='static') {
            return
          }
          $scope.displaystar = star;
        };
        $scope.clearDisplayStar = function(){
          if($scope.mode=='static') {
            return
          }
          $scope.displaystar = null;
        };

        $scope.getRating = function(){
          Rating.get({entityId: $scope.entityid, userid: $scope.user}, function(result){
            if(resultHandler.process(result)){
              $scope.myRating = result.data[0] || {};
            }
          });
        };

        $scope.rate = function(rating){
          var query = {};
          if($scope.myRating && $scope.myRating._id){
            query.ratingId = $scope.myRating._id;
            $scope.myRating.entityId = $scope.entityid;
            $scope.myRating.rating = rating;
            $scope.myRating.points = $scope.pointsMap[rating];
          }
          else{
            $scope.myRating = {
              entityId: $scope.entityid,
              rating: rating,
              points: $scope.pointsMap[rating]
            };
          }
          Rating.save(query, $scope.myRating, function(result){
            if(resultHandler.process(result)){

            }
          })
        };
      }]
    }
  }]);

	return module;
}));

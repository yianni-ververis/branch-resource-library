app.controller("searchController", ["$scope", "$resource", "$state", "$stateParams", function($scope, $resource, $state, $stateParams){
  scope.$on('senseready', function(params){
    console.log('sense is ready says the search controller');
  });
}]);

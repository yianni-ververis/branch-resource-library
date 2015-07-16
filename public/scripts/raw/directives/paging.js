//this is a directive/module specific to Branch and it's server paging mechanism
(function (root, factory) {
	if (typeof exports === 'object') {
		module.exports = factory(root, require('angular'));
	} else if (typeof define === 'function' && define.amd) {
		define(['angular'], function (angular) {
			return (root.ngPaging = factory(root, angular));
		});
	} else {
		root.ngPaging = factory(root, root.angular);
	}
}(this, function (window, angular) {
	var module = angular.module('ngPaging', []);
  module.provider('pagingConfig', function() {
    return {
			$get: function(){
				return {}
			}
		};
  });

  module.factory('paging', ['$rootScope', function ($rootScope) {
		return {};
  }]);


  module.directive('pagingControl', ['pagingConfig', '$timeout', function (pagingConfig, $timeout) {
    return {
			restrict: "E",
			scope:{
				info: "=",
				sortoptions: "=",
				sort: "="
			},
      template: function(elem, attr){
        html = '<div class="project-result-header">\
	        Showing {{info.pages[info.currentPage-1].pageStart + 1 || 1}} - {{info.pages[info.currentPage-1].pageEnd}} of {{info.total}} results\
	        <div class="paging">\
	          <label>Page {{info.currentPage}} of {{info.pages.length}}</label>\
	          <ul class="page-list plainlist">\
	            <li ng-hide="info.currentPage==1">\
	              <a href="#projects?page=1&sort={{sort.id}}" class="icon first"></a>\
	            </li>\
	            <li ng-hide="info.currentPage==1">\
	              <a href="#projects?page={{info.currentPage-1}}&sort={{sort.id}}" class="icon prev"></a>\
	            </li>\
	            <li ng-repeat="page in info.pages" ng-show="pageInRange(page.pageNum)" ng-class="{active: page.pageNum==info.currentPage}">\
	              <a href="#projects?page={{page.pageNum}}&sort={{sort.id}}">{{page.pageNum}}</a>\
	            </li>\
	            <li ng-show="info.currentPage < info.pages.length">\
	              <a href="#projects?page={{info.currentPage+1}}&sort={{sort.id}}" class="icon next"></a>\
	            </li>\
	            <li ng-show="info.currentPage < info.pages.length">\
	              <a href="#projects?page={{info.pages.length}}&sort={{sort.id}}" class="icon last"></a>\
	            </li>\
	          </ul>\
	        </div>';
					if(attr.enablesorting){
							html += '<div class="sorting">\
			          <label>Sort by: </label><select class="form-control" ng-change="applySort()" ng-model="sort" ng-options="item.name for item in sortoptions track by item.id"/>\
			        </div>'
					}
	        html += '</div>';
					return html;
      },
      link: function(scope){
				scope.pageInRange = function(pageIndex){
					var minPage, maxPage;
					if(scope.info.currentPage <= 2){
						minPage = 1;
						maxPage = 5
					}
					else if (scope.info.currentPage >= scope.info.pages.length - 2) {
						minPage = scope.info.pages.length - 5;
						maxPage = scope.info.pages.length;
					}
					else{
						minPage = scope.info.currentPage - 2;
						maxPage = scope.info.currentPage + 2;
					}
					return (pageIndex >= minPage && pageIndex <= maxPage);
				};
				scope.applySort = function(){
			    window.location = "#projects?page="+scope.info.currentPage+"&sort="+ scope.sort.id;
			  };
      }
    }
  }]);

	return module;
}));

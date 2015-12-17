app.directive("branchtree", ['$interval', function($interval) {
  return {
    restrict: "E",
    replace: true,
    scope: {
      width: '@',
      height: '@'
    },
    controller: ['$scope', '$element', function($scope, $element) {

      var width = $scope.width;
      var height = $scope.height;

      // Tree configuration
      var branches = [];
      var seed = {i: 0, x: width / 2 , y: height, a: 0, l: 70, d:0}; // a = angle, l = length, d = depth
      var da = 0.6; // Angle delta
      var dl = 0.8; // Length delta (factor)
      var ar = 0.4; // Randomness
      var maxDepth = 6;
      var animationbreak = 0;
      var loop;

      var svg = d3.select($element[0])
        .append('svg')
        .attr('width', width)
        .attr('height', height)


      function branch(b) {
        var end = endPt(b), daR, newB;
        branches.push(b);

        if (b.d === maxDepth)
          return;

        // Left branch
        daR = ar * Math.random() - ar * 0.5;
        newB = {
          i: branches.length,
          x: end.x,
          y: end.y,
          a: b.a - da + daR,
          l: b.l * dl,
          d: b.d + 1,
          parent: b.i
        };
        branch(newB);

        // Right branch
        daR = ar * Math.random() - ar * 0.5;
        newB = {
          i: branches.length,
          x: end.x,
          y: end.y,
          a: b.a + da + daR,
          l: b.l * dl,
          d: b.d + 1,
          parent: b.i
        };
        branch(newB);
      };

      function endPt(b) {
        // Return endpoint of branch
        var x = b.x + b.l * Math.sin( b.a );
        var y = b.y - b.l * Math.cos( b.a );
        return {x: x, y: y};
      };

      function x1(d) {return d.x;}
      function y1(d) {return d.y;}
      function x2(d) {return endPt(d).x;}
      function y2(d) {return endPt(d).y;}

      function create() {

        branches = [];
        branch(seed);

        svg.selectAll('line')
        .data(branches)
        .enter()
        .append('line')
        .style('stroke', '#8A8A8A')
        .style('opacity', 0.6)
        .style('stroke-width', function(d) { return parseInt(maxDepth + 1 - d.d) + 'px';})
        .attr('id', function(d) {return 'id-'+d.i;})
        .transition()
        .duration(500)
        .delay(function(d, i) { return i * 10; })
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2);

        loop = $interval(update, 4000, 30);

      };

      var update = function() {

        branches = [];
        branch(seed);

        svg.selectAll('line')
          .data(branches)
          .transition()
          .duration(2500)
          .attr('x1', x1)
          .attr('y1', y1)
          .attr('x2', x2)
          .attr('y2', y2)

      };
      
      create();
      
      $scope.$on('$destroy', function() {
        $scope.$destroy();
        $scope = null;
        $interval.cancel(loop);
        $element.remove();
        $element = null;
        update = null;
      })

    }]
  }
}]);

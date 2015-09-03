app.directive('searchInput', ['searchExchange', '$state', '$interpolate', function (searchExchange, $state, $interpolate) {
  return {
    restrict: "E",
    replace: true,
    scope:{

    },
    templateUrl: "/views/search/search-input.html",
    link: function(scope){
      var ignoreKeys = [
        16,
        27
      ];
      var reservedKeys = [ //these keys should not execute another search, they are reserved for the suggestions mechanism
        9,
        13,
        38,
        40,
        39,
        37,
        32
      ];

      var Key = {
          BACKSPACE: 8,
          ESCAPE: 27,
          TAB: 9,
          ENTER: 13,
          SHIFT: 16,
          UP: 38,
          DOWN: 40,
          RIGHT: 39,
          LEFT: 37,
          DELETE: 46,
          SPACE: 32
      };

      scope.searchTimeout = 300;
      scope.suggestTimeout = 100;
      scope.searchTimeoutFn;
      scope.suggestTimeoutFn;
      scope.suggesting = false;
      scope.activeSuggestion = 0;

      scope.cursorPosition = 0;
      scope.$on('senseready', function(params){
        console.log('sense is ready');
      });

      scope.$on('searchResults', function(event, results){

      });

      scope.$on('suggestResults', function(event, results){

        scope.suggestions = results.qSuggestions;
        scope.showSuggestion();
      });

      scope.$on('cleared', function(results){
        scope.searchText = "";
        scope.cursorPosition = 0;
        scope.suggestions = [];
        scope.suggesting = false;
        scope.activeSuggestion = 0;
        scope.ghostPart = "";
        scope.ghostQuery = "";
        scope.ghostDisplay = "";
      });



      scope.keyDown = function(event){
        if(event.keyCode == Key.ESCAPE){
          scope.hideSuggestion();
          return;
        }
        if(event.keyCode == Key.DOWN){
          //show the suggestions again
          scope.showSuggestion();
        }
        if(event.keyCode == Key.RIGHT){
          //activate the next suggestion
          if(scope.suggesting){
            event.preventDefault();
            scope.nextSuggestion();
          }
        }
        if(event.keyCode == Key.LEFT){
          //activate the previous suggestion
          if(scope.suggesting){
            event.preventDefault();
            scope.prevSuggestion();
          }
        }
        if(event.keyCode == Key.ENTER || event.keyCode == Key.TAB){
          if(scope.suggesting){
            event.preventDefault();
            scope.acceptSuggestion();
          }
        }
        if(event.keyCode == Key.SPACE){
            scope.hideSuggestion();
        }

      };

      scope.keyUp = function(event){
        scope.cursorPosition = event.target.selectionStart;
        if(ignoreKeys.indexOf(event.keyCode) != -1){
          return;
        }
        if(reservedKeys.indexOf(event.keyCode) == -1){
          if(scope.searchText.length > 0){
            scope.preSearch();
            scope.preSuggest();
          }
          else{
            //clear the search
            scope.clear();
          }
        }
      };

      scope.nextSuggestion = function(){
        if(scope.activeSuggestion==scope.suggestions.length-1){
          scope.activeSuggestion = 0;
        }
        else{
          scope.activeSuggestion++;
        }
        scope.drawGhost();
      };
      scope.prevSuggestion = function(){
        if(scope.activeSuggestion==0){
          scope.activeSuggestion = scope.suggestions.length-1;
        }
        else{
          scope.activeSuggestion--;
        }
        scope.drawGhost();
      };
      scope.hideSuggestion = function(){
        scope.suggesting = false;
        scope.activeSuggestion = 0;
        scope.ghostPart = "";
        scope.ghostQuery = "";
        scope.ghostDisplay = "";
      };
      scope.showSuggestion = function(){
        if(scope.searchText.length > 1 && scope.cursorPosition==scope.searchText.length && scope.suggestions.length > 0){
          scope.suggesting = true;
          scope.drawGhost();
        }
      };
      scope.setAndAccept = function(index){
        scope.activeSuggestion = index;
        scope.drawGhost();
        scope.acceptSuggestion();
      }
      scope.acceptSuggestion = function(){
        scope.searchText = scope.ghostQuery;
        scope.suggestions = [];
        scope.hideSuggestion();
        scope.preSearch();
      };
      scope.drawGhost = function(){
        scope.ghostPart = getGhostString(scope.searchText, scope.suggestions[scope.activeSuggestion].qValue);
        scope.ghostQuery = scope.searchText + scope.ghostPart;
        scope.ghostDisplay = "<span style='color: transparent;'>"+scope.searchText+"</span>"+scope.ghostPart;
      }

      scope.preSuggest = function(){
        if(scope.searchText.length > 1 && scope.cursorPosition==scope.searchText.length){
          if(scope.suggestTimeoutFn){
            clearTimeout(scope.suggestTimeoutFn);
          }
          scope.suggestTimeoutFn = setTimeout(function(){
            searchExchange.suggest(scope.searchText);
          }, scope.suggestTimeout);
        }
      };

      scope.preSearch = function(){
        if(scope.searchTimeoutFn){
          clearTimeout(scope.searchTimeoutFn);
        }
        scope.searchTimeoutFn = setTimeout(function(){
          searchExchange.search(scope.searchText);
        }, scope.searchTimeout);
      };

      scope.clear = function(){
        searchExchange.clear();
      };

      function getGhostString(query, suggestion){
        var suggestBase = query;
        while(suggestBase.length > suggestion.length){
          suggestBase = suggestBase.split(" ");
          suggestBase.splice(0,1);
          suggestBase = suggestBase.join(" ");
        }
        var re = new RegExp(suggestBase, "i")
        return suggestion.replace(re,"");
      }
    }
  }
}]);

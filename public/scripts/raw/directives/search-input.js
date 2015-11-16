app.directive('searchInput', ['$state', '$interpolate', "confirm", function ($state, $interpolate, confirm) {
  return {
    restrict: "E",
    replace: true,
    $scope:{

    },
    templateUrl: "/views/search/search-input.html",
    controller: function($scope, $element, $attrs){
      $.ajax({type: "GET", dataType: "text", contentType: "application/json", url: '/configs/'+$attrs.config+'.json', success: function(json){
        $scope.config = JSON.parse(json);
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

        $scope.searchText;

        $scope.searchTimeout = 300;
        $scope.suggestTimeout = 100;
        $scope.searchTimeoutFn;
        $scope.suggestTimeoutFn;
        $scope.suggesting = false;
        $scope.activeSuggestion = 0;

        $scope.cursorPosition = 0;
        // $scope.$on('senseready', function(params){
        //   console.log('sense is ready');
        // });

        //$scope.$on('cleared', function(results){
        searchExchange.subscribe('cleared', $attrs.view, function(){
          $scope.searchText = "";
          if(el = document.getElementById("branch-search-input")){
            el.value = "";
          }
          $scope.cursorPosition = 0;
          $scope.suggestions = [];
          $scope.suggesting = false;
          $scope.activeSuggestion = 0;
          $scope.ghostPart = "";
          $scope.ghostQuery = "";
          $scope.ghostDisplay = "";
          setTimeout(function(){
            $scope.preSearch();
          }, 0);
        });



        $scope.keyDown = function(event){
          if(event.keyCode == Key.ESCAPE){
            $scope.hideSuggestion();
            return;
          }
          else if(event.keyCode == Key.DOWN){
            //show the suggestions again
            $scope.showSuggestion();
          }
          else if(event.keyCode == Key.RIGHT){
            //activate the next suggestion
            if($scope.suggesting){
              event.preventDefault();
              $scope.nextSuggestion();
            }
          }
          else if(event.keyCode == Key.LEFT){
            //activate the previous suggestion
            if($scope.suggesting){
              event.preventDefault();
              $scope.prevSuggestion();
            }
          }
          else if(event.keyCode == Key.ENTER || event.keyCode == Key.TAB){
            if($scope.suggesting){
              event.preventDefault();
              $scope.acceptSuggestion();
            }
          }
          else if(event.keyCode == Key.SPACE){
            //we'll check here to make sure the latest term is at least 2 characters
            if($scope.searchText.split(" ").length==5){
              confirm.prompt("I hate to break it to you but you can only search for 5 things. Must try harder!", {options:["Thanks, I accept this without question"]}, function(response){
              });
              event.preventDefault();
              return false;
            }
            else if($scope.searchText.split(" ").pop().length==1){
              confirm.prompt("You'll need to search for something longer than '"+$scope.searchText.split(" ").pop()+"'", {options:["That makes sense."]}, function(response){
              });
              event.preventDefault();
              return false;
            }
            else{
              $scope.hideSuggestion();
            }
          }
          else{
            $scope.hideSuggestion();
          }

        };

        $scope.keyUp = function(event){
          $scope.cursorPosition = event.target.selectionStart;
          if(ignoreKeys.indexOf(event.keyCode) != -1){
            return;
          }
          if(reservedKeys.indexOf(event.keyCode) == -1){
            if($scope.searchText && $scope.searchText.length > 0){
              //we'll check here to make sure the latest term is at least 2 characters before searching
              if($scope.searchText.split(" ").pop().length>1){
                $scope.preSearch();
                $scope.preSuggest();
              }
            }
            else{
              //clear the search
              $scope.clear();
            }
          }
        };

        $scope.nextSuggestion = function(){
          if($scope.activeSuggestion==$scope.suggestions.length-1){
            $scope.activeSuggestion = 0;
          }
          else{
            $scope.activeSuggestion++;
          }
          $scope.drawGhost();
        };
        $scope.prevSuggestion = function(){
          if($scope.activeSuggestion==0){
            $scope.activeSuggestion = $scope.suggestions.length-1;
          }
          else{
            $scope.activeSuggestion--;
          }
          $scope.drawGhost();
        };
        $scope.hideSuggestion = function(){
          $scope.suggesting = false;
          $scope.activeSuggestion = 0;
          $scope.ghostPart = "";
          $scope.ghostQuery = "";
          $scope.ghostDisplay = "";
        };
        $scope.showSuggestion = function(){
          if($scope.searchText && $scope.searchText.length > 1 && $scope.cursorPosition==$scope.searchText.length && $scope.suggestions.length > 0){
            $scope.suggesting = true;
            $scope.drawGhost();
          }
          else{
            $scope.suggesting = false;
            $scope.removeGhost();
          }
        };
        $scope.setAndAccept = function(index){
          $scope.activeSuggestion = index;
          $scope.drawGhost();
          $scope.acceptSuggestion();
        }
        $scope.acceptSuggestion = function(){
          $scope.searchText = $scope.ghostQuery;
          $scope.suggestions = [];
          $scope.hideSuggestion();
          $scope.preSearch();
        };
        $scope.drawGhost = function(){
          $scope.ghostPart = getGhostString($scope.searchText, $scope.suggestions[$scope.activeSuggestion].qValue);
          $scope.ghostQuery = $scope.searchText + $scope.ghostPart;
          $scope.ghostDisplay = "<span style='color: transparent;'>"+$scope.searchText+"</span>"+$scope.ghostPart;
        }
        $scope.removeGhost = function(){
          $scope.ghostPart = null;
          $scope.ghostQuery = null;
          $scope.ghostDisplay = null;
        }

        $scope.preSuggest = function(){
          if($scope.searchText.length > 1 && $scope.cursorPosition==$scope.searchText.length){
            if($scope.suggestTimeoutFn){
              clearTimeout($scope.suggestTimeoutFn);
            }
            $scope.suggestTimeoutFn = setTimeout(function(){
              searchExchange.suggest($scope.searchText, $scope.config.suggestFields || []);
            }, $scope.suggestTimeout);
          }
        };

        $scope.preSearch = function(){
          if($scope.searchTimeoutFn){
            clearTimeout($scope.searchTimeoutFn);
          }
          $scope.searchTimeoutFn = setTimeout(function(){
            searchExchange.search($scope.searchText, $scope.config.searchFields || []);
          }, $scope.searchTimeout);
        };

        $scope.clear = function(){
          searchExchange.clear();
        };

        $scope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
          if(toState.name!="loginsignup"){
            searchExchange.view = toState.name.split(".")[0];
          }
          if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || toState.name!="loginsignup"){ //then we should clear the search state
            //searchExchange.clear(true);
          }
        });

        $scope.$root.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
          //if there is an existing state we should update the pageTop property on the $scope
          //and apply patches to the object for sorting
          setTimeout(function(){
            if(fromState.name.split(".")[0]==toState.name.split(".")[0]){ //then we should clear the search state
              if(toState.name.split(".").length==1){ //we only need to do this if we're on a listing page
                $scope.searchText = "";
                if(searchExchange.state){
                  if(searchExchange.state && searchExchange.state.searchText){
                    $scope.searchText = searchExchange.state.searchText;
                    document.getElementById("branch-search-input").value = $scope.searchText;
                    //$scope.preSearch();
                  }
                }
                $scope.preSearch();
              }
            }
          },0);
        });

        searchExchange.subscribe("update", $attrs.view, function(){
          if(!$scope.searchText){
            if(searchExchange.state && searchExchange.state.searchText){
              $scope.searchText = searchExchange.state.searchText;
              //document.getElementById("branch-search-input").value = $scope.searchText;
            }
          }
        });

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
      }});
    }
  }
}]);

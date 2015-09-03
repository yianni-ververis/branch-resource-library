app.service('searchExchange', ["$rootScope", function($rootScope){
  var that = this;
  var config = {
    host: "10.211.55.3:8080/anon",
    isSecure: false
  };

  this.objects = {};
  this.online = false;

  var senseApp;

  qsocks.Connect(config).then(function(global){
    global.openDoc("bf6c1ed8-69fb-4378-86c2-a1c71a2b3cc1").then(function(app){
      senseApp = app;
      $rootScope.$broadcast("senseready", app);
    }, function(error) {
        if (error.code == "1002") { //app already opened on server
            global.getActiveDoc().then(function(app){
              senseApp = app;
              $rootScope.$broadcast("senseready", app);
            });
        } else {
            console.log(error)
            $rootScope.$broadcast("senseoffline");
        }
    });
  });
  $rootScope.$on("senseready", function(params){
    console.log('connected to sense app');
    that.online = true;
  });
  $rootScope.$on("senseoffline", function(params){
    console.log('could not connected to sense app. using mongo instead.');
    that.online = false;
  });

  this.clear = function(){
    if(senseApp){
      senseApp.clearAll().then(function(){
          $rootScope.$broadcast("cleared");
      });
    }
    else{
      $rootScope.$broadcast("cleared");
    }
  };

  this.render = function(){
    $rootScope.$broadcast("update");
  }

  this.search = function(searchText){
    that.terms = searchText.split(" ");
    senseApp.selectAssociations({qContext: "CurrentSelections"}, that.terms, 0 ).then(function(results){
      $rootScope.$broadcast('searchResults', results);
    });
  };

  this.suggest = function(searchText){
    senseApp.searchSuggest({}, searchText.split(" ")).then(function(results){
      console.log(results);
      $rootScope.$broadcast('suggestResults', results);
    });
  };

  this.addFilter = function(field, title, callbackFn){
    $rootScope.$on("senseready", function(event, senseApp){
      var lbDef = {
        qInfo:{
          qType: "ListObject"
        },
        qListObjectDef:{
          qStateName: "$",
          qDef:{
            qFieldDefs:[field]
          },
          qAutoSortByState: {
            qDisplayNumberOfRows: 8
          }
        }
      };
      senseApp.createSessionObject(lbDef).then(function(response){
        callbackFn.call(null, {handle: response.handle, object: new qsocks.GenericObject(response.connection, response.handle)});
      });

    });
  };

  this.addResults = function(fields, pageSize, sorting, callbackFn){
    $rootScope.$on("senseready", function(event, senseApp){
      var hDef = {
        "qInfo" : {
            "qType" : "HyperCube"
        },
        "qHyperCubeDef": {
          "qInitialDataFetch": [
            {
              "qHeight" : pageSize,
              "qWidth" : fields.length
            }
          ],
          "qDimensions" : buildFieldDefs(fields, sorting),
          "qMeasures": [],
        	"qSuppressZero": false,
        	"qSuppressMissing": false,
        	"qMode": "S",
        	"qInterColumnSortOrder": [1],
        	"qStateName": "$"
        }
      }
      senseApp.createSessionObject(hDef).then(function(response){
        callbackFn.call(null, {handle: response.handle, object: new qsocks.GenericObject(response.connection, response.handle)});
      });
    });
  }

  function buildFieldDefs(fields, sorting){
    return fields.map(function(f){
      var def = {
  			"qDef": {
  				"qFieldDefs": [
  					f
  				],
          "qSortIndicator" : "A"
  			},
  			"qNullSuppression": true
  		}
      if(f==sorting.id){
        var sort = {
          "autoSort": false
        };
        sort[sorting.senseType] = sorting.order;
        def.qDef["qSortCriterias"] = [sort];
      }
      return def;
    });
  }

}])

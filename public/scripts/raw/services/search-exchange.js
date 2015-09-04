app.service('searchExchange', ["$rootScope", function($rootScope){
  var that = this;
  // var config = {
  //   host: "10.211.55.3:8080/anon",
  //   isSecure: false
  // };
  var config = {
    host: "diplomaticpulse.qlik.com",
    isSecure: true
  };

  this.objects = {};
  this.online = false;

  this.queue = [];

  var senseApp;

  qsocks.Connect(config).then(function(global){
    //global.openDoc("bf6c1ed8-69fb-4378-86c2-a1c71a2b3cc1").then(function(app){
    global.openDoc("b8cd05a8-bb43-4670-bda5-1b6ff16640b8").then(function(app){
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
    //execute any queued up items
    for (var i=0;i<that.queue.length;i++){
      that.queue[i].call();
    }
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
  this.fresh = function(){
      this.search("");
  }

  this.search = function(searchText){
    that.terms = searchText.split(" ");
    senseApp.selectAssociations({qContext: "Cleared"}, that.terms, 0 ).then(function(results){
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
    var fn = function(){
      senseApp.createSessionObject(lbDef).then(function(response){
        callbackFn.call(null, {handle: response.handle, object: new qsocks.GenericObject(response.connection, response.handle)});
      });
    }
    if(that.online){
      fn.call();
    }
    else{
      that.queue.push(fn);
    }
  };

  this.addResults = function(fields, pageSize, sorting, defaultSort, callbackFn){
    var hDef = {
      "qInfo" : {
          "qType" : "table"
      },
      "qHyperCubeDef": {
        "qInitialDataFetch": [
          {
            "qHeight" : pageSize,
            "qWidth" : fields.length
          }
        ],
        //"qInitialDataFetch": [],
        "qDimensions" : buildFieldDefs(fields, sorting),
        "qMeasures": [],
      	"qSuppressZero": false,
      	"qSuppressMissing": false,
      	"qInterColumnSortOrder": defaultSort
      }
    }
    var fn = function(){
      senseApp.createSessionObject(hDef).then(function(response){
        callbackFn.call(null, {handle: response.handle, object: response});
      });
    }
    if(that.online){
      fn.call();
    }
    else{
      that.queue.push(fn);
    }
  }

  function buildFieldDefs(fields, sorting){
    return fields.map(function(f){
      var def = {
  			"qDef": {
  				"qFieldDefs": [f.name]
        },
        qNullSuppression: f.suppressNull
  		}
      if(sorting[f.name]){
        var sort = {
          //"autoSort": false
          //"qSortByLoadOrder" : 1
        };
        sort[sorting[f.name].senseType] = sorting[f.name].order;
        def["qDef"]["qSortCriterias"] = [sort];
      }
      return def;
    });
  }

}])

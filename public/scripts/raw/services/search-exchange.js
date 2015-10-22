app.service('searchExchange', ["$rootScope", "userManager", function($rootScope, userManager){
  var that = this;
  // var config = {
  //   host: "10.211.55.3:8080/anon",
  //   isSecure: false
  // };
  var config = {
    host: "qtdevrelations",
    prefix: "/anon",
    isSecure: true
  };

  this.objects = {};
  this.online = false;

  this.priority = [];
  this.queue = [];

  this.pendingSearch;
  this.pendingSuggest;

  var senseApp;

  qsocks.Connect(config).then(function(global){
    // global.openDoc("bf6c1ed8-69fb-4378-86c2-a1c71a2b3cc1").then(function(app){
    global.openDoc("a4e123af-4a5d-4d89-ac81-62ead61db33a").then(function(app){
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
    that.executePriority();
    that.online = true;
  });
  $rootScope.$on("senseoffline", function(params){
    that.online = false;
  });

  this.init = function(defaultSelections){
    $rootScope.$broadcast("initialising");
    if(defaultSelections && defaultSelections.length > 0){
      defaultSelections.forEach(function(selection, index){
        that.makeSelection(selection, function(result) {
          if(index==defaultSelections.length-1){
            that.lockSelections(function(){
              $rootScope.$broadcast("initialised", app);
              that.executeQueue();
            })
          }
        }, true);
      });
    }
    else{
        that.executeQueue();
    }
  };

  this.executeQueue = function(){
    for (var i=0;i<that.queue.length;i++){
      that.queue[i].call();
    }
    $rootScope.$broadcast("update");
  };

  this.executePriority = function(){
    if(that.priority && that.priority.length > 0){
      that.priority.forEach(function(priorityFn, index){
        priorityFn.call(null);
        if(index = that.priority.length-1){
          that.priority = [];
        }
      })
    }
    else{
      that.executeQueue();
    }
  };

  this.clear = function(unlock){
    if(senseApp){
      if(unlock && unlock==true){
        senseApp.unlockAll().then(function(){
          senseApp.clearAll().then(function(){
              $rootScope.$broadcast("cleared");
          });
        });
      }
      else{
        senseApp.clearAll().then(function(){
            $rootScope.$broadcast("cleared");
        });
      }
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
    $rootScope.$broadcast("searching");
    that.terms = searchText.split(" ");

    senseApp.searchAssociations({qContext: "LockedFieldsOnly", qSearchFields:["SearchField"]}, that.terms, {qOffset: 0, qCount: 5, qMaxNbrFieldMatches: 5}).then(function(results){
      console.log(results);
      if(results.qTotalSearchResults > 0){
        senseApp.selectAssociations({qContext: "LockedFieldsOnly", qSearchFields:["SearchField"]}, that.terms, 0 ).then(function(results){
          $rootScope.$broadcast('searchResults', true);
        });
      }
      else{
        $rootScope.$broadcast('searchResults', false)
      }
    });
  };

  this.suggest = function(searchText){
    senseApp.searchSuggest({}, searchText.split(" ")).then(function(results){
      console.log(results);
      $rootScope.$broadcast('suggestResults', results);
    });
  };

  this.addFilter = function(options, callbackFn, priority){
    var fn;
    if(that.objects[options.id]){
      fn = function(){
        callbackFn.call(null, {object:that.objects[options.id]});
      }
    }
    else{
      fn = function(){
        var lbDef = {
          qInfo:{
            qType: "ListObject"
          },
          qListObjectDef:{
            qStateName: "$",
            qDef:{
              qFieldDefs:[options.field]
            },
            qAutoSortByState: {
              qDisplayNumberOfRows: 8
            }
          }
        };
        senseApp.createSessionObject(lbDef).then(function(response){
          //callbackFn.call(null, {handle: response.handle, object: new qsocks.GenericObject(response.connection, response.handle)});
          callbackFn.call(null, {object: response});
        });
      };
    }
    if(that.online){
      fn.call();
    }
    else{
      if(priority){
        that.priority.push(fn);
      }
      else{
        that.queue.push(fn);
      }
    }
  };

  this.makeSelection = function(options, callbackFn, priority){
    if(that.objects[options.id]){
      fn = function(){
        callbackFn.call(null, {object:that.objects[options.id]});
      }
    }
    else{
      fn = function(){
        senseApp.getField(options.field).then(function(result){
          result.selectValues(options.values).then(function(result){
            callbackFn.call(null, {object: result});
          });
        });
      };
    }
    if(that.online){
      fn.call();
    }
    else{
      if(priority){
        that.priority.push(fn);
      }
      else{
        that.queue.push(fn);
      }
    }
  };

  that.lockSelections = function(callbackFn){
    fn = function(){
      senseApp.lockAll().then(function(result){
        callbackFn.call(null);
      });
    }
    if(that.online){
      fn.call();
    }
    else{
      if(priority){
        that.priority.push(fn);
      }
      else{
        that.queue.push(fn);
      }
    }
  }

  //this.addResults = function(fields, pageSize, sorting, defaultSort, callbackFn, priority){
  this.addResults = function(options, callbackFn, priority){
    var fn;
    if(that.objects[options.id]){
      fn = function(){
        callbackFn.call(null, {object:that.objects[options.id]});
      }
    }
    else{
      //create a new session object
      fn = function(){
        var hDef = {
          "qInfo" : {
              "qType" : "table"
          },
          "qHyperCubeDef": {
            "qDimensions" : buildFieldDefs(options.fields, options.sortOptions),
            "qMeasures": buildMeasureDefs(options.fields),
          	"qSuppressZero": false,
          	"qSuppressMissing": true,
          	"qInterColumnSortOrder": options.defaultSort
          }
        }
        senseApp.createSessionObject(hDef).then(function(response){
          that.objects[options.id] = response;
          callbackFn.call(null, {object:response});
        });
      }
    }
    if(that.online){
      fn.call();
    }
    else{
      that.queue.push(fn);
    }
  }

  function buildFieldDefs(fields, sorting){
    var defs = [];
    for (var i=0;i<fields.length;i++){
      if(fields[i].dimension){
        var def = {
    			"qDef": {
    				"qFieldDefs": [fields[i].dimension]
          },
          qNullSuppression: fields[i].suppressNull
    		}
        if(sorting[fields[i].dimension]){
          var sort = {
            //"autoSort": false
            //"qSortByLoadOrder" : 1
          };
          sort[sorting[fields[i].dimension].sortType] = sorting[fields[i].dimension].order;
          def["qDef"]["qSortCriterias"] = [sort];
        }
        defs.push(def);
      }
    }
    return defs;
  }

  function buildMeasureDefs(fields){
    var defs = [];
    for (var i=0;i<fields.length;i++){
      if(fields[i].measure){
        var def = {
          "qDef": {
  					"qLabel": fields[i].label,
  					"qDescription": "",
  					"qDef": fields[i].measure
  				}
        }
        if(fields[i].sortType){
          def["qSortBy"] = {};
          def["qSortBy"][fields[i].sortType] = fields[i].order;
        }
        defs.push(def);
      }
    };
    return defs;
  }

}])

app.service('searchExchange', ["$rootScope", "$stateParams", "userManager", "publisher", function($rootScope, $stateParams, userManager, publisher){
  var that = this;
  // var config = {
  //   host: "10.211.55.3:8080/anon",
  //   isSecure: false,
  //   rejectUnauthorized: false
  // };
  var config = {
    host: "qtdevrelations",
    prefix: "/anon",
    isSecure: true,
    appname: 'a4e123af-4a5d-4d89-ac81-62ead61db33a',
    rejectUnauthorized: false
  };

  this.seqId = 0;

  this.objects = {};
  this.online = false;

  this.priority = [];
  this.queue = [];

  this.pendingSearch;
  this.pendingSuggest;

  this.state;

  this.catalog = {};

  this.subscribe = function(eventName, id, callbackFn){
    if(!that.catalog[eventName]){
      that.catalog[eventName] = {};
    }
    if(!that.catalog[eventName][id]){
      that.catalog[eventName][id] = {fn: callbackFn};
    }
  };

  this.publish = function(eventName, handles, data){
    if(that.catalog[eventName]){
      for(var sub in that.catalog[eventName]){
        that.catalog[eventName][sub].fn.call(null, data);
      }
    }
  };

  $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
    if(fromState.name.split(".")[0]!=toState.name.split(".")[0]){ //then we should clear the search state
      that.state = null;
    }
  });



  this.setStateAttr = function(name, prop){
    if(!that.state){
      that.state = {};
    }
    that.state[name] = prop;
    $stateParams[name] = JSON.stringify(prop)
  };

  this.matched;

  var senseApp;

  qsocks.Connect(config).then(function(global){
    //global.openDoc("bf6c1ed8-69fb-4378-86c2-a1c71a2b3cc1").then(function(app){
    global.openDoc("a4e123af-4a5d-4d89-ac81-62ead61db33a").then(function(app){
      senseApp = app;
      that.seqId = senseApp.connection.seqid;
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
              that.lockSelections(function(result){
                console.log('lock change');
                //$rootScope.$broadcast("update");
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
    if(that.queue.length > 0){
      for (var i=0;i<that.queue.length;i++){
        that.queue[i].call();
        if(i==that.queue.length-1){
          that.queue = [];
          console.log('update after queue');
          $rootScope.$broadcast("update");
          //publisher.publish("update");
        }
      }
    }
    else {
      //publisher.publish("update");
      $rootScope.$broadcast("update");
    }
  };

  this.executePriority = function(){
    if(that.priority && that.priority.length > 0){
      that.priority.forEach(function(priorityFn, index){
        priorityFn.call(null);
        if(index = that.priority.length-1){
          that.priority = [];
          that.executeQueue();
        }
      })
    }
    else{
      that.executeQueue();
    }
  };

  this.clear = function(unlock){
    console.log('clearing state');
    console.log(that.state);
    if(that.state && that.state.searchText){
      that.state.searchText = null;
    }
    if(that.state && that.state.searchFields){
      that.state.searchFields = null;
    }
    if(senseApp){
      if(unlock && unlock==true){
        that.ask(senseApp.handle, "UnlockAll", [], function(){
          that.ask(senseApp.handle, "ClearAll", [],function(result){
            console.log('clear change');
            console.log(result);
            $rootScope.$broadcast("cleared");
          });
        });
      }
      else{
        that.ask(senseApp.handle, "ClearAll", [],function(result){
          console.log('clear change');
          console.log(result);
          $rootScope.$broadcast("cleared");
        });
      }
    }
    else{
      $rootScope.$broadcast("cleared");
    }
  };

  this.render = function(){
    console.log('exchange render called');
    $rootScope.$broadcast("update");
  }
  this.fresh = function(){
      this.search("");
  }

  this.search = function(searchText, searchFields){
    that.setStateAttr("searchText", searchText);
    that.setStateAttr("searchFields", searchFields);

    $rootScope.$broadcast("searching");
    that.terms = searchText.split(" ");

    //senseApp.searchAssociations({qContext: "CurrentSelections", qSearchFields: searchFields}, that.terms, {qOffset: 0, qCount: 5, qMaxNbrFieldMatches: 5}).then(function(results){
    that.seqId++;
    that.pendingSearch = that.seqId;
    senseApp.connection.ask(senseApp.handle, "SearchAssociations", [{qContext: "LockedFieldsOnly", qSearchFields: searchFields}, that.terms, {qOffset: 0, qCount: 5, qMaxNbrFieldMatches: 5}], that.seqId).then(function(response){
      if(response.id == that.pendingSearch){
        if(response.result.qResults.qTotalSearchResults > 0){
          //senseApp.selectAssociations({qContext: "LockedFieldsOnly", qSearchFields:searchFields}, that.terms, 0 ).then(function(results){
          that.ask(senseApp.handle, "SelectAssociations", [{qContext: "LockedFieldsOnly", qSearchFields:searchFields}, that.terms, 0], function(response){
            console.log('update from search with data');
            $rootScope.$broadcast('update', true);
          });
        }
        else{
          console.log('update from search without data');
          $rootScope.$broadcast('update', false)
        }
      }
    });
  };

  this.suggest = function(searchText, suggestFields){
    //senseApp.searchSuggest({qContext: "LockedFieldsOnly", qSearchFields: suggestFields}, searchText.split(" ")).then(function(results){
    that.seqId++;
    that.pendingSuggest = that.seqId;
    senseApp.connection.ask(senseApp.handle, "SearchSuggest", [{qContext: "LockedFieldsOnly", qSearchFields: suggestFields}, searchText.split(" ")], that.seqId).then(function(response){
      if(response.id == that.pendingSuggest){
        $rootScope.$broadcast('suggestResults', response.result.qResult);
      }
    });
  };

  this.addFilter = function(options, callbackFn, priority){
    var fn;
    if(that.objects[options.id]){
      fn = function(){
        callbackFn.call(null, {handle:that.objects[options.id]});
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
        that.seqId++;
        senseApp.connection.ask(senseApp.handle, "CreateSessionObject", [lbDef], that.seqId).then(function(response){
          //callbackFn.call(null, {handle: response.handle, object: new qsocks.GenericObject(response.connection, response.handle)});
          console.log('adding filter for '+ options.field+' with handle '+response.result.qReturn.qHandle);
          that.objects[options.id] = response.result.qReturn.qHandle;
          callbackFn.call(null, {handle: response.result.qReturn.qHandle});
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
    if(f = that.objects[options.field]){
      fn = function(){
        that.ask(f, "SelectValues", [options.values], function(response){
          callbackFn.call(null, response);
        });
      }
    }
    else{
      fn = function(){
        that.ask(senseApp.handle, "GetField" ,[options.field], function(response){
          that.objects[options.field] = response.qReturn.qHandle;
          that.ask(response.qReturn.qHandle, "SelectValues", [options.values], function(response){
            callbackFn.call(null, response);
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
      that.ask(senseApp.handle, "LockAll", [], function(result){
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
        callbackFn.call(null, {handle:that.objects[options.id]});
      }
    }
    else{
      console.log('creating results for '+options.id);
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
        that.seqId++;
        senseApp.connection.ask(senseApp.handle, "CreateSessionObject", [hDef], that.seqId).then(function(response){
          // that.seqId++;
          // senseApp.connection.ask(response.result.qReturn.qHandle, "GetObject", [], that.seqId).then(function(response){
          //   that.objects[options.id] = response.result.qLayout;
          //   callbackFn.call(null, {object:response.result});
          // });
          that.objects[options.id] = response.result.qReturn.qHandle;
          console.log(that.objects);
          callbackFn.call(null, {handle:response.result.qReturn.qHandle});
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

  this.ask = function(handle, method, args, callbackFn){
    that.seqId++;
    senseApp.connection.ask(handle, method, args, that.seqId).then(function(response){
      callbackFn.call(null, response.result);
    });
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

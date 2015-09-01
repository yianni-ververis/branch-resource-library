app.service('searchExchange', ["$rootScope", function($rootScope){
  var that = this;
  var config = {
    host: "10.211.55.3:8080/anon",
    isSecure: false
  };

  this.objects = {};

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
        }
    });
  });
  $rootScope.$on("senseready", function(params){
    console.log("exchange says sense is ready");
  });

  this.search = function(searchText){
    that.terms = searchText.split(" ");
    senseApp.selectAssociations({qContext: "Cleared"}, that.terms, 0 ).then(function(results){
      $rootScope.$broadcast('searchResults', results);
    });
  };

  this.addFilter = function(field, title, callbackFn){
    that.objects[field] = {
      title: title,
      name: field,
      type: "session-listbox"
    };
    $rootScope.$on("senseready", function(event, senseApp){
      var lbDef = {
        qInfo:{
          qType: "ListObject"
        },
        qListObjectDef:{
          qStateName: "$",
          qDef:{
            qFieldDefs:[field]
          }
        }
      };
      senseApp.createSessionObject(lbDef).then(function(response){
        // that.objects[name].handle= response.handle;
        // that.objects[name].object = new qsocks.GenericObject(response.connection, response.handle);
        //that.renderObject(field, "session-listbox");
        callbackFn.call(null, {handle: response.handle, object: new qsocks.GenericObject(response.connection, response.handle)});
      });

    });
  };

}])

var https = require('https');
var fs = require('fs');
var crypto = require('crypto');

module.exports = {
  config: null,
  init: function(){

  },
  test: function(){
    this.qrsSend('/qrs/about', "GET", null, function(status, data){
      console.log('test successful');
    });
  },
  reload: function(){
    console.log('reloading app - '+ this.config.app);
    console.log('on server - '+this.config.host);
    this.qrsSend('/qrs/app/'+this.config.app+"/reload", "POST", null, function(status, data){
      console.log(status);
      console.log(data)
    });
  },
  executeTask : function(name){
    this.qrsSend('/qrs/task/start/synchronous?name='+name, "POST", null, function(status, data){
      console.log('finished executing task');
    });
  },
  generateXrfkey: function (size, chars) {
      size = size || 16;
      chars = chars || 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789';
      var rnd = crypto.randomBytes(size), value = new Array(size), len = chars.length;
      for (var i = 0; i < size; i++) {
          value[i] = chars[rnd[i] % len]
      };
      return value.join('');
  },
  qrsSend: function(url, method, data, callbackFn){
    try {
        var cert = fs.readFileSync(this.config.cert);
    } catch (e) {
        console.log('Missing client certificate');
        return;
    }
    var xrfkey = this.generateXrfkey();

    var path = url.indexOf("?")==-1? url+'?xrfkey='+xrfkey : url+'&xrfkey='+xrfkey;

    var settings = {
        host: this.config.host,
        port: 4242,
        path: path,
        method: method,
        headers: {
          'x-qlik-xrfkey': xrfkey,
          'X-Qlik-User': 'UserDirectory=Internal;UserId=sa_repository'
        },
        key: cert,
        cert: cert,
        rejectUnauthorized: false
    };

    console.log(settings);

    var responseData = "";

    console.log('starting request');

    https.request(settings, function (response) {
      response.on('data', function (chunk) {
        console.log('reload data called');
        responseData+=chunk;
      });
      response.on('end', function(){ //we don't get all the data at once so we need to wait until the request has finished before we end the response
        console.log('reload end called');
        callbackFn.call(null, response.statusCode, responseData);
      });
    }).on('error', function(e){
      console.log("Got error: " + e);
    });
  }
};

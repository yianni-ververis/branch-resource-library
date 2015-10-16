app.controller("authController", ["$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", function($scope, $resource, $state, $stateParams, userManager, resultHandler, notifications){
  var Login = $resource("auth/login");
  var Signup = $resource("auth/signup");
  var Reset = $resource("auth/reset");
  var Captcha = $resource("visualcaptcha/try");

  if($stateParams.url){
    $scope.returnUrl = $stateParams.url.replace(/%2F/gi, '');
  }

  $scope.captchaOptions = {
                imgPath: 'bower_components/visualcaptcha.angular/img/',
                captcha: {
                    numberOfImages: 4,
                    url: "/visualcaptcha",
                    supportsAudio: false
                },
                init: function ( captcha ) {
                    $scope.captcha = captcha;
                }
            };

  $scope.login = function(){
    Login.save({
      username: $scope.loginusername,
      password: $scope.loginpassword
    }, function(result){
      if(resultHandler.process(result)){
        userManager.refresh();
        window.location = "#" + $scope.returnUrl || "/";
      }
      else{
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    });
  };

  $scope.signup = function(){
    //check the captcha form has been filled
    if ($scope.isVisualCaptchaFilled()){
      //check that the captcha selection is correct
      var captchaField = $(".imageField")[0];
      var captchaCheck = {};
      captchaCheck[$(captchaField).attr('name')] = $(captchaField).attr('value');
      console.log(captchaCheck);
      Captcha.save(captchaCheck, function(result){
        if(result.status=="valid"){
          Signup.save({
            username: $scope.username,
            password: $scope.password,
            email: $scope.email
          }, function(result) {
            if(resultHandler.process(result)){
              userManager.refresh();
              window.location = "#" + $scope.returnUrl || "/";
            }
            else{
              notifications.notify(result.errText, null, {sentiment: 'negative'});
            }
          });
        }
        else{
          notifications.notify("Specified captcha is not correct", null, {sentiment: 'negative'});
        }
      });
    }
  };

  $scope.reset = function() {
    Reset.save({
      email: $scope.email2
    }, function(result) {
      if(resultHandler.process(result)){
        userManager.refresh();
        window.location = "#" + $scope.returnUrl || "/";
      }
      else{
        notifications.notify(result.errText, null, {sentiment: 'negative'});
      }
    })
  };

  $scope.isVisualCaptchaFilled = function() {
      if ( !$scope.captcha.getCaptchaData().valid ) {
          notifications.notify("visualCaptcha is NOT filled", null, {sentiment: 'warning'});
          return false;
      }
      return true;
  };

}]);

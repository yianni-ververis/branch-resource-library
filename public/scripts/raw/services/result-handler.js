app.service('resultHandler', ["notifications", function(notifications){
  this.processing = false;
  this.process = function(result, action, preventRedirect){   //deals with the result in a generic way. Return true if the result is a success otherwise returns false
    if(result.redirect && !preventRedirect){  //should only redirect a user to the login page
      if(!this.processing){
        this.processing = true;
        window.location = result.redirect + "?url=" + window.location.hash.replace("#/","");
      }
      return false;
    }
    else if (result.errCode) {
      console.log(result.errText);
      notifications.showError({
        message: result.errText,
        hideDelay: 3000,
        hide: true
      });
      return false;
    }
    else {
      //if an action has been passed notify the user of it's success
      if(action){
        notifications.showSuccess({message: action + " Successful"});
      }
      return true;
    }
  }
}]);

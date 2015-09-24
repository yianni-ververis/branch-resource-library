app.service('userManager', ['$resource', function($resource){
  var System = $resource("system/:path", {path: "@path"});
  this.menu = {};
  this.userInfo = {};
  var that = this;
  this.canUpdateAll = function(entity){
    return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].allOwners && this.userInfo.role.permissions[entity].allOwners==true;
  }
  this.canCreate = function(entity){
    return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].create && this.userInfo.role.permissions[entity].create==true;
  }
  this.canRead = function(entity){
    return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].read && this.userInfo.role.permissions[entity].read==true;
  }
  this.canUpdate = function(entity, owner){
    if (this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].update && this.userInfo.role.permissions[entity].update==true){
      if(!this.userInfo.role.permissions[entity].allOwners || this.userInfo.role.permissions[entity].allOwners==false){
        if(this.userInfo._id==owner){
          return true;
        }
        else{
          return false;
        }
      }
      else{
        return true
      }
    }
  }
  this.canApprove = function(entity){
    return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].approve && this.userInfo.role.permissions[entity].approve==true;
  }
  this.canFlag = function(entity){
    return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].flag && this.userInfo.role.permissions[entity].flag==true;
  }
  this.canHide = function(entity){
    return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].hide && this.userInfo.role.permissions[entity].hide==true;
  }
  this.canDelete = function(entity){
    return this.hasPermissions() && this.userInfo.role.permissions[entity] && this.userInfo.role.permissions[entity].delete && this.userInfo.role.permissions[entity].delete==true;
  }
  this.hasUser = function(){
    return !$.isEmptyObject(that.userInfo);
  }
  this.refresh = function(){
    System.get({path:'userInfo'}, function(result){
      that.menu = result.menu;
      that.userInfo = result.user;
    });
  }
  this.hasPermissions = function(){
    return this.userInfo && this.userInfo.role && this.userInfo.role.permissions;
  }
  this.refresh();
}]);

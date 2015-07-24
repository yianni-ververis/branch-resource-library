app.service('userManager', ['$resource', function($resource){
  var System = $resource("system/:path", {path: "@path"});
  this.menu = {};
  this.userInfo = {};
  var that = this;
  this.canCreate = function(entity){
    return this.userInfo.userInfo.permissions[entity] && this.userInfo.userInfo.permissions[entity].create && this.userInfo.userInfo.permissions[entity].create==true
  }
  this.canRead = function(entity){
    console.log(entity);
    return this.userInfo.permissions[entity] && this.userInfo.permissions[entity].read && this.userInfo.permissions[entity].read==true
  }
  this.canUpdate = function(entity){
    return this.userInfo.permissions[entity] && this.userInfo.permissions[entity].update && this.userInfo.permissions[entity].update==true
  }
  this.canDelete = function(entity){
    return
    (this.userInfo.permissions[entity] && this.userInfo.permissions[entity].softDelete && this.userInfo.permissions[entity].softDelete==true)
    ||
    (this.userInfo.permissions[entity] && this.userInfo.permissions[entity].hardDelete && this.userInfo.permissions[entity].hardDelete==true)
  }
  this.canSeeAll = function(entity){
    return this.userInfo.permissions[entity] && this.userInfo.permissions[entity].allOwners && this.userInfo.permissions[entity].allOwners==true
  }
  this.canApprove = function(entity){
    return this.userInfo.permissions[entity] && this.userInfo.permissions[entity].approve && this.userInfo.permissions[entity].approve==true
  }
  this.refresh = function(){
    System.get({path:'userInfo'}, function(result){
      that.menu = result.menu;
      that.userInfo = result.user;
    });
  }
  this.refresh();
}]);

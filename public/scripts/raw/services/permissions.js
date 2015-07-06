app.service('userPermissions', ['$resource', function($resource){
  var System = $resource("system/:path", {path: "@path"});
  this.permissions = {};
  var that = this;
  this.canCreate = function(entity){
    return this.permissions[entity] && this.permissions[entity].create && this.permissions[entity].create==true
  }
  this.canRead = function(entity){
    console.log(entity);
    return this.permissions[entity] && this.permissions[entity].read && this.permissions[entity].read==true
  }
  this.canUpdate = function(entity){
    return this.permissions[entity] && this.permissions[entity].update && this.permissions[entity].update==true
  }
  this.canDelete = function(entity){
    return
    (this.permissions[entity] && this.permissions[entity].softDelete && this.permissions[entity].softDelete==true)
    ||
    (this.permissions[entity] && this.permissions[entity].hardDelete && this.permissions[entity].hardDelete==true)
  }
  this.canSeeAll = function(entity){
    return this.permissions[entity] && this.permissions[entity].allOwners && this.permissions[entity].allOwners==true
  }
  this.canApprove = function(entity){
    return this.permissions[entity] && this.permissions[entity].approve && this.permissions[entity].approve==true
  }
  this.refresh = function(){
    System.get({path:'userpermissions'}, function(result){
      that.permissions = result;
    });
  }
  this.refresh();
}]);

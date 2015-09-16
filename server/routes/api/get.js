//These routes are for updating records
var MasterController = require("../../controllers/master"),
    entities = require("../entityConfig");

module.exports = {
  get: function(req, res){
    //This route is for find a specific record on the specified entity
    //url parameters can be used to add filtering
    var query = { $and: [ { userid: req.body.userid }, { entityId: req.body.entityId } ] };
    query["_id"] = req.params.id;
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions[entity];
    //console.log(userPermissions);
    //check that the user has sufficient permissions for this operation
    if(!userPermissions || userPermissions.update!=true){
      res.json(Error.insufficientPermissions);
    }
    else{
      if(userPermissions.allOwners!=true && !entities[entity].exemptFromOwnership){
        query["createuser"]=user._id;
      }
      MasterController.get(req.query, query, entities[entity], function(response){
        res.json(response);
        }
      );
    }
  }
}
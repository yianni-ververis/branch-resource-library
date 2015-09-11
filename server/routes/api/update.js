//These routes are for updating records
var MasterController = require("../../controllers/master"),
    entities = require("../entityConfig");

module.exports = {
  update: function(req, res){
    //This route is for saving a specific record on the specified entity
    //url parameters can be used to add filtering
    //Requires "update" permission on the specified entity
    var query = req.query || {};
    query["_id"] = req.params.id;
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions[entity];
    var data = req.body;
    //console.log(userPermissions);
    //check that the user has sufficient permissions for this operation
    if(!userPermissions || userPermissions.update!=true){
      res.json(Error.insufficientPermissions);
    }
    else{
      if(userPermissions.allOwners!=true && !entities[entity].exemptFromOwnership){
        query["createuser"]=user._id;
      }
      MasterController.get(req.query, query, entities[entity], function(response){    //This ensures that users can only update records they own (where applicable)
        if(response.data.length > 0){
          MasterController.save(query, data, entities[entity], function(result){
            res.json(result);
          });
        }
        else{
          res.json(Error.noRecord);
        }
      });
    }
  },
  updateProject: function(req, res){
    //This route is for saving a specific record on the 'Project' entity
    //url parameters can be used to add filtering
    //Requires "update" permission on the 'Project' entity
    //Again this has been separated due to the nature of saving a 'Project'
    var query = req.query || {};
    query["_id"] = req.params.id;
    var entity = 'projects';
    var user = req.user;
    var userPermissions = req.user.role.permissions[entity];
    var data = req.body;
    //check that the user has sufficient permissions for this operation
    if(!userPermissions || userPermissions.update!=true){
      res.json(Error.insufficientPermissions);
    }
    else{
      if(userPermissions.allOwners!=true && !entities[entity].exemptFromOwnership){
        query["createuser"]=user._id;
      }
      MasterController.get(req.query, query, entities[entity], function(response){    //This ensures that users can only update records they own (where applicable)
        if(response.data.length > 0){
          MasterController.save(query, data, entities[entity], function(result){
            res.json(result);
          });
        }
        else{
          res.json(Error.noRecord);
        }
      });
    }
  }
};
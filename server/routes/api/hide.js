//This route is for hiding a specific record on the specified entity
//Requires "hide" permissions on the specified entity
//Sets the 'approved' field to false making it invisible to users without 'approve' permissions
var MasterController = require("../../controllers/master"),
    entities = require("../entityConfig"),
    qrs = require("../../../SenseQRS");

module.exports = function(req, res){
  var query = req.query || {};
  query["_id"] = req.params.id;
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  console.log('hiding item');
  //check that the user has sufficient permissions for this operation
  if(!userPermissions || userPermissions.hide!=true){
    res.json(Error.insufficientPermissions());
  }
  else{
    MasterController.get(req.query, query, entities[entity], function(response){    //This ensures that users can only update records they own (where applicable)
      if(response.data.length > 0){
        MasterController.save(query, {approved: false}, entities[entity], function(result){
          //we should execute a reload of the app here
          //qrs.executeTask("Branch_Reload");
          res.json(result);
        });
      }
      else{
        res.json(Error.noRecord());
      }
    });
  }
};

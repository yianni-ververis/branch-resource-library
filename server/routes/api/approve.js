//This route is for hiding a specific record on the specified entity
//Requires 'approve' permissions on the specified entity
//Sets the 'approved' field to true making it visible to everyone
//and sets 'flagged' to false
var MasterController = require("../../controllers/master"),
    entities = require("../entityConfig");

module.exports = function(req, res){
  var query = req.query || {};
  query["_id"] = req.params.id;
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];

  //check that the user has sufficient permissions for this operation
  if(!userPermissions || userPermissions.approve!=true){
    res.json(Error.insufficientPermissions);
  }
  else{
    MasterController.get(req.query, query, entities[entity], function(response){    //This ensures that users can only update records they own (where applicable)
      if(response.data.length > 0){
        //first remove all flags
        MasterController.save(query, {approved: true, hide_comment: ""}, entities[entity], function(result){
          //we should execute a reload of the app here
          res.json(result);
        });
      }
      else{
        res.json(Error.noRecord);
      }
    });
  }
};

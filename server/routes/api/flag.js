//This route is for flagging a specific record on the specified entity
//Requires "flag" permission on the specified entity
var MasterController = require("../../controllers/master"),
    entities = require("../entityConfig"),
    Flag = require("../../models/flag"),
    Error = require("../../controllers/error");

module.exports = {
  flag: function(req, res){
    var query = req.query || {};
    query["_id"] = req.params.id;
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions[entity];

    //check that the user has sufficient permissions for this operation
    if(!userPermissions || userPermissions.flag!=true){
      res.json(Error.insufficientPermissions());
    }
    else{
      MasterController.get(req.query, query, entities[entity], function(response){    //This ensures that users can only update records they have access to
        if(response.data.length > 0){
          var flag = new Flag();
          flag.userid = user._id;
          flag.flagged = true;
          flag.entity = req.params.entity;
          flag.entityId = req.params.id;
          flag.save(function(err){
            if(err){

            }
            else{
              res.json(flag);
            }
          });
        }
        else{
          res.json(Error.noRecord());
        }
      });
    }
  },
  unflag: function(req, res){
    var query = req.query || {};
    query["entityId"] = req.params.id;
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions[entity];
    //check that the user has sufficient permissions for this operation
    if(!userPermissions || userPermissions.flag!=true){
      res.json(Error.insufficientPermissions());
    }
    else{
      if(userPermissions.approve==false){
        query["userid"] = user._id;
      }
      Flag.update(query, {flagged: false}, function(err, result){
        if(err){
          console.log(err);
        }
        else{
          res.json(result);
        }
      });        
    }
  }
};

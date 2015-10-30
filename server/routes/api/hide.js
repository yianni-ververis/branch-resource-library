//This route is for hiding a specific record on the specified entity
//Requires "hide" permissions on the specified entity
//Sets the 'approved' field to false making it invisible to users without 'approve' permissions
var MasterController = require("../../controllers/master"),
    entities = require("../entityConfig"),
    Error = require("../../controllers/error"),
    mailer = require('../../controllers/emailer');

module.exports = function(req, res){
  var query = req.query || {};
  query["_id"] = req.params.id;
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  //check that the user has sufficient permissions for this operation
  if(!userPermissions || userPermissions.hide!=true){
    res.json(Error.insufficientPermissions());
  }
  else{
    MasterController.get(req.query, query, entities[entity], function(response){
      if(response.data.length > 0){
        MasterController.save(query, {approved: false, hide_comment: req.body.hideComment}, entities[entity], function(result){
          mailer.sendMail('unapprove', req.params.entity, result, function(){

          });
          res.json(result);
        });
      }
      else{
        res.json(Error.noRecord());
      }
    });
  }
};

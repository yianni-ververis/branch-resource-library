var express = require('express'),
    router = express.Router(),
    Auth = require('../../controllers/auth'),
    Error = require('../../controllers/error'),
    MasterController = require('../../controllers/master');

//Include all Controllers for now
//This should later be changed for a 'master' controller
var entities = {
    
};

//This route is for getting a list of results for the specified entity
//url parameters can be used to add filtering
//Requires 'read' permission on the specified entity
router.get("/:entity", Auth.isLoggedIn, function(req, res){
  var query = req.query || {};
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  //check that the user has sufficient permissions for this operation
  if(!userPermissions || userPermissions.read!=true){
    res.json([Error.insufficientPermissions]);
  }
  else{
    if(userPermissions.allOwners!=true && entities[entity].exemptFromOwnership!=true){
      query['createuser']=user._id;
    }
    console.log(query);
    MasterController.get(query, entities[entity], function(results){
      console.log('GET results are - '+results);
      res.json(results || []);
    });
  }
});

//This route is for getting a count of results for the specified entity
//url parameters can be used to add filtering
//Requires 'read' permission on the specified entity
router.get("/:entity/count", Auth.isLoggedIn, function(req, res){
  var query = req.query || {};
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  //check that the user has sufficient permissions for this operation
  if(!userPermissions || userPermissions.read!=true){
    res.json([Error.insufficientPermissions]);
  }
  else{
    if(userPermissions.allOwners!=true){
      query['createuser']=user._id;
    }
    console.log(query);
    MasterController.count(query, entities[entity], function(results){
      res.json([results]||[]);
    });
  }
});

//This route is for getting a specific result from the specified entity
//url parameters can be used to add filtering
//Requires 'read' permission on the specified entity
router.get("/:entity/:id", Auth.isLoggedIn, function(req, res){
  var query = req.query || {};
  query["_id"] = req.params.id;
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  //check that the user has sufficient permissions for this operation
  if(!userPermissions || userPermissions.read==false){
    res.json([Error.insufficientPermissions]);
  }
  else{
    if(userPermissions.allOwners!=true){
      query['createuser']=user._id;
    }
    MasterController.get(query, entities[entity],function(results){
      if(results.length>0){
        res.json(results || []);
      }
      else{
        res.json([Error.insufficientPermissions]);
      }
    });
  }
});

//This route is for creating a new record on the specified entity and returning the new record
//Requires 'create' permission on the specified entity
router.post("/:entity/", Auth.isLoggedIn, function(req, res){
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  var data = req.body;
  if(!userPermissions || userPermissions.create!=true){
    res.json(Error.insufficientPermissions);
  }
  else{
    data.createuser = user._id;
    MasterController.save(null, data, entities[entity], function(result){
      res.json(result);
    });
  }
});


//This route is for saving a specific record on the specified entity
//url parameters can be used to add filtering
//Requires 'update' permission on the specified entity
router.post("/:entity/:id", Auth.isLoggedIn, function(req, res){
  var query = req.query || {};
  query["_id"] = req.params.id;
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  var data = req.body;
  console.log(userPermissions);
  //check that the user has sufficient permissions for this operation
  if(!userPermissions || userPermissions.update!=true){
    res.json(Error.insufficientPermissions);
  }
  else{
    if(userPermissions.allOwners!=true){
      query['createuser']=user._id;
    }
    MasterController.get(query, entities[entity], function(records){
      if(records.length > 0){
        MasterController.save(query, data, entities[entity], function(result){
          res.json(result);
        });
      }
      else{
        res.json(Error.noRecord);
      }
    });
  }
});

//This route is for deleting a list of records on the specified entity
//url parameters can be used to add filtering
//Requires 'delete' permission on the specified entity
router.delete("/:entity", Auth.isLoggedIn, function(req, res){
  var query = req.query || {};
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  if(!userPermissions || userPermissions.delete!=true){
    res.json(Error.insufficientPermissions);
  }
  else{
    if(userPermissions.allOwners!=true){
      query['createuser']=user._id;
    }
    MasterController.delete(query, entities[entity], function(result){
      res.json(result);
    });
  }
});

//This route is for deleting a specific record on the specified entity
//url parameters can be used to add filtering
//Requires 'delete' permission on the specified entity
router.delete("/:entity/:id", Auth.isLoggedIn, function(req, res){
  var query = req.query || {};
  query["_id"] = req.params.id;
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  if(!userPermissions || userPermissions.delete!=true){
    res.json(Error.insufficientPermissions);
  }
  else{
    if(userPermissions.allOwners!=true){
      query['createuser']=user._id;
    }
    MasterController.delete(query, entities[entity], function(result){
      res.json(result);
    });
  }
});

module.exports = router;

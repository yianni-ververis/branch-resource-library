var express = require("express"),
    router = express.Router(),
    Auth = require("../../controllers/auth"),
    Error = require("../../controllers/error"),
    MasterController = require("../../controllers/master"),
    entities = require("../entityConfig"),
    epoch = require("milli-epoch"),
    git = require("github"),
    atob = require("atob"),
    GitHub = new git({
        // required
        version: "3.0.0",
        // optional
        debug: true,
        protocol: "https",
        host: "api.github.com", // should be api.github.com for GitHub
        pathPrefix: "", // for some GHEs; none for GitHub
        timeout: 5000,
        headers: {
            "user-agent": "qlik-branch" // GitHub is happy with a unique user agent
        }
    });

GitHub.authenticate({type: "basic", username: "switchnick", password: "c0mp0und"});

//This route is for getting a list of results for the specified entity
//url parameters can be used to add filtering
//Requires "read" permission on the specified entity
router.get("/:entity", Auth.isLoggedIn, function(req, res){
  var queryObj = parseQuery(req.query || {}, req.body || {}, "GET", entities[req.params.entity]);
  var query = queryObj.query;
  var entity = queryObj.entity;
  var user = req.user;
  var userPermissions;
  if(req.user){
    userPermissions = req.user.role.permissions[req.params.entity];
  }
  //check that the user has sufficient permissions for this operation
  if((!userPermissions || userPermissions.read!=true) && entity.requiresAuthentication){
    res.json(Error.insufficientPermissions);
  }
  else{
    if((userPermissions && userPermissions.allOwners!=true) && entity.exemptFromOwnership!=true && !entity.requiresAuthentication){
      query["createuser"]=user._id;
    }
    MasterController.get(req.query, query, entity, function(results){
      res.json(results || {});
    });
  }
});

//This route is for getting a count of results for the specified entity
//url parameters can be used to add filtering
//Requires "read" permission on the specified entity
router.get("/:entity/count", Auth.isLoggedIn, function(req, res){
  var queryObj = parseQuery(req.query || {}, req.body || {}, "GET", entities[req.params.entity]);
  var query = queryObj.query;
  var entity = queryObj.entity;
  var user = req.user;
  var userPermissions;
  //check that the user has sufficient permissions for this operation
  if(req.user){
    userPermissions = req.user.role.permissions[req.params.entity];
  }
  //check that the user has sufficient permissions for this operation
  if((!userPermissions || userPermissions.read!=true) && entity.requiresAuthentication){
    res.json(Error.insufficientPermissions);
  }
  else{
    if((userPermissions && userPermissions.allOwners!=true) && entity.exemptFromOwnership!=true && !entity.requiresAuthentication){
      query["createuser"]=user._id;
    }
    console.log(query);
    MasterController.count(req.query, query, entity, function(results){
      res.json(results||{});
    });
  }
});

//This route is for getting a specific result from the specified entity
//url parameters can be used to add filtering
//Requires "read" permission on the specified entity
//If the requested entity is "projects" then we check first to see if the latest
//data has been fetched from git within the last hour. If not we need to update the db
//with the latest data from git. Otherwise we return the document from mongo
router.get("/:entity/:id", Auth.isLoggedIn, function(req, res){
  var queryObj = parseQuery(req.query || {}, req.body || {}, "GET", entities[req.params.entity]);
  var query = queryObj.query;
  var entity = queryObj.entity;
  query["_id"] = req.params.id;
  var user = req.user;
  var userPermissions;
  //check that the user has sufficient permissions for this operation
  if((!userPermissions || userPermissions.read!=true) && entity.requiresAuthentication){
    res.json(Error.insufficientPermissions);
  }
  else{
    if((userPermissions && userPermissions.allOwners!=true) && entity.exemptFromOwnership!=true && !entity.requiresAuthentication){
      query["createuser"]=user._id;
    }
    MasterController.get(req.query, query, entity, function(results){
      if(results.data[0] && results.data[0].project_site.indexOf('github')!=-1 && ((results.data[0].last_git_check && results.data[0].last_git_check < epoch.addMinutes(-60))||(!results.data[0].last_git_check))){
        var params = results.data[0].project_site.split("/");
        var repo = params.pop();
        var gituser = params.pop();
        GitHub.repos.get({user:gituser, repo:repo}, function(err, gitresult){
          console.log('Getting git info');
          if(err){
            res.json(Error.custom(err.message));
          }
          else{
            //update the contributors

            //update the update date and git check data
            results.data[0].last_updated = epoch.toEpoch(new Date(gitresult.updated_at));
            results.data[0].last_git_check = epoch.now();
            GitHub.repos.getReadme({user:gituser, repo:repo}, function(err, readmeresult){
              console.log(atob(readmeresult.content));
              results.data[0].pagetext = atob(readmeresult.content);
              results.data[0].save();
              res.json(results || {});
            });
          }
        });
      }
      else{
        res.json(results || {});
      }
    });
  }
});

//This route is for creating a new record on the specified entity and returning the new record
//Requires "create" permission on the specified entity
router.post("/:entity/", Auth.isLoggedIn, function(req, res){
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[entity];
  var data = req.body;
  if(!userPermissions || userPermissions.create!=true){
    console.log('should get here');
    res.json(Error.insufficientPermissions());
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
//Requires "update" permission on the specified entity
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
});

//This route is for deleting a list of records on the specified entity
//url parameters can be used to add filtering
//Requires "delete" permission on the specified entity
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
      query["createuser"]=user._id;
    }
    MasterController.delete(query, entities[entity], function(result){
      res.json(result);
    });
  }
});

//This route is for deleting a specific record on the specified entity
//url parameters can be used to add filtering
//Requires "delete" permission on the specified entity
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
      query["createuser"]=user._id;
    }
    MasterController.delete(query, entities[entity], function(result){
      res.json(result);
    });
  }
});

//this function parses any sorting or paging parameters and contstructs the mongodb query accordingly.
//Currently only used for GET requests
function parseQuery(query, body, method, originalEntity){
  var entity = cloneObject(originalEntity);
  var mongoQuery = {};
  query = query || {};
  body = body || {};
  if(query.sort){
    var sortFields = query.sort.toString().split(",");
    var sortOrders = query.sortOrder.toString().split(",");
    var sort = {};
    for(var i=0; i < sortFields.length; i++){
      sort[sortFields[i]] = sortOrders[i] || 1;
    }
    entity.sort = sort;
    console.log(sort);
    delete query["sort"];
    delete query["sortOrder"];
  }
  entity.skip = query.skip || entity.skip || 0;
  entity.limit = query.limit || entity.limit || 0;
  delete query["skip"];
  delete query["limit"];

  if(method=="GET"){
    query = concatObjects([query, body]);
  }

  mongoQuery.entity = entity;
  mongoQuery.query = query;

  return mongoQuery;
}

function cloneObject(object){
  var clone = {};
  for (var key in object){
    clone[key] = object[key];
  }
  return clone;
}

function concatObjects(objects){
  var result = {};
  for (var o in objects){
    for (var key in objects[o]) result[key]=objects[o][key];
  }
  return result;
}

module.exports = router;

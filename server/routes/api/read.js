var MasterController = require("../../controllers/master"),
    entities = require("../entityConfig"),
    Flags = require("../../models/flag"),
    Error = require("../../controllers/error");

module.exports = {
  getHidden: function(req, res){
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
      res.json(Error.insufficientPermissions("Unable to get "+req.params.entity));
    }
    else{
      if((userPermissions && userPermissions.approve!=true && entity.exemptFromApproval!=true)
          || (!user)){
        query["approved"]=false;
        MasterController.getIds(req.query, query, entity, function(results){
          res.json(results);
        });
      }
      else{
        res.json({data:[]});
      }
    }
  },
  getFlagged: function(req, res){
    var queryObj = parseQuery(req.query || {}, req.body || {}, "GET", entities[req.params.entity]);
    var query = queryObj.query;
    var entity = queryObj.entity;
    entity.model = Flags;
    var user = req.user;
    var userPermissions;
    if(req.user){
      userPermissions = req.user.role.permissions[req.params.entity];

      //check that the user has sufficient permissions for this operation
      if((!userPermissions || userPermissions.read!=true) && entity.requiresAuthentication){
        res.json(Error.insufficientPermissions("Unable to get "+req.params.entity));
      }
      else{
        query["entity"]=req.params.entity;  //we only ever get flagged records for a specific entity
        query["flagged"] = true;  //we only ever get flagged records
        if((userPermissions && userPermissions.approve!=true && entity.exemptFromApproval!=true)
            || (!user)){
            query["userid"] = user._id;
        }
        console.log(query);
        MasterController.get(req.query, query, entity, function(results){
          res.json(results);
        });
      }
    }
    else{
      res.json({});
    }
  }
};

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

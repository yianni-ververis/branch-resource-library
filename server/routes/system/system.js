var express = require('express'),
    router = express.Router(),
    Error = require('../../controllers/error'),
    MasterController = require('../../controllers/master');

router.get('/userpermissions', function(req, res){
  if(req.user&&req.user.role){
    res.json(req.user.role.permissions);
  }
  else{
    res.json(Error.notLoggedIn);
  }
});

module.exports = router;

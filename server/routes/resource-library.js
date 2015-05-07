var express = require('express');
var router = express.Router();
var resource = require('../controllers/resource');

router.get('/', function(req, res){
    res.render('../server/views/resources/index.jade');
});

router.get('/browse', function(req, res){
  res.render('../server/views/browse.jade');
});

router.get('/:resourceId', function(req, res){
  resource.get(req.params.resourceId, function(result){
    res.render('../server/views/resource.jade', {isAuthenticated: req.isAuthenticated(), resource: result});
  })
});

module.exports = router;

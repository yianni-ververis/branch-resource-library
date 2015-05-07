var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    res.render('../server/views/blog/index.jade');
});

module.exports = router;

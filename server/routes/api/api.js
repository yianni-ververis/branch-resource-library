var express = require('express'),
    router = express.Router();

var masterRoutes = require('./master');

router.use('/', masterRoutes);

module.exports = router;

//NOTE: all GET api calls should return an array of results
//      all POST (update) api calls should return a single json object
//      all POST (insert) api calls should return either a single json object or the _id of the new entry

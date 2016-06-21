var envconfig = require("../../../config"),
    AWS = require("aws-sdk");

module.exports = function(req, res){
    var key = req.params.url;
    // 20 characters is for //s3.amazonaws.com/ (19+1)
    key = key.substring(20 + envconfig.s3.bucket.length);
    var params = {Bucket: envconfig.s3.bucket, Key: key};
    var s3obj = new AWS.S3();
    s3obj.deleteObject(params, function(err, result) {
            res.status(200).end();
        });
};
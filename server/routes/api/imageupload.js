var envconfig = require("../../../config"),
    fs = require("fs"),
    formidable = require("formidable"),
    uuid = require("uuid"),
    AWS = require("aws-sdk");

module.exports = function(req, res){
    var form = new formidable.IncomingForm();
    //Formidable uploads to operating systems tmp dir by default
    form.keepExtensions = true;     //keep file extension

    form.parse(req, function(err, fields, files) {
        fs.readFile(files.file.path,{}, function(err, data) {
            var extension = files.file.name.substring(files.file.name.lastIndexOf("."));
            uploadFile(data,extension,function(err, result) {
                if (err) {
                    console.log("Error Uploading to S3", err);
                    res.status(500);
                    res.json("There was an issue uploading the file");
                } else {
                    res.json(result);
                }
            });
        });
    });
};

function uploadFile(data, extension, next) {
    var key = "attachments/tmp/" + uuid.v4() + extension;

    var s3obj = new AWS.S3({params: {Bucket: envconfig.s3.bucket, Key: key}});
    s3obj.upload({Body: data})
        .send(function(err, result) {
            var result = {
                url: "//s3.amazonaws.com/" + envconfig.s3.bucket + "/" + key
            }
            next(err, result);
        });
};
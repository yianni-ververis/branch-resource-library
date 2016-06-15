//These routes are for creating or updating records
var MasterController = require("../../controllers/master"),
    Error = require("../../controllers/error"),
    Notifier = require("../../controllers/notifier"),
    Mailer = require("../../controllers/emailer"),
    ImageHandler = require("summernote-imagehandler"),
    fs = require('fs'),
    attachmentDir = require("../../../attachmentDir"),
    envconfig = require("../../../config"),
    entities = require("../entityConfig"),
    mongoose = require("mongoose"),
    epoch = require("milli-epoch"),
    AWS = require("aws-sdk");
    atob = require("atob");

module.exports = function(req, res){
  //This route is for creating a new record on the 'Project' entity and returning the new record
  //Requires "create" permission on the 'Project' entity
  //This has been separated due to the nature of creating a 'Project'
  var entity = req.params.entity;
  var user = req.user;
  var userPermissions = req.user.role.permissions[req.params.entity];
  var data = req.body;
  var query = req.query || {};
  var isNew = false;
  var imageEntities = [
    "project",
    "blog",
    "user"
  ];
  if(req.params.id){
    query["_id"] = req.params.id;
  }
  //else{
  if(userPermissions){
    var record = data.standard || data;
    if(!record._id && !req.params.id && !hasProps(req.query)){
      //this is a new item
      isNew = true;
      if(userPermissions.create!=true){
        res.json(Error.insufficientPermissions());
      }
      record._id = mongoose.Types.ObjectId();
      record.createuser = user._id;
      record.userid = user._id;
      record.createdate = Date.now();
      record.createdate_num = new Date(Date.now()).getTime();
      record.last_updated = Date.now();
      record.last_updated_num = new Date(Date.now()).getTime();
    }
    else{
      if(userPermissions.update!=true){
        res.json(Error.insufficientPermissions());
      }
      else if (entity=="userprofile" && req.user.role.name!="admin") {
        //get the existing user
        entities["userprofile"].model.findOne({_id: record._id}).populate("role").exec( function(err, result){
          console.log(result.role._id);
          console.log(record.role._id);
          if(result && result.role._id != record.role._id){
            res.json(Error.insufficientPermissions());
            //this will crash node but in theory we should never make it here
          }
        });
      }
    }
    if(userPermissions.allOwners!=true && !isNew && req.params.entity != "userprofile"){
      query["userid"]=user._id;
    }
    record.edituser = user._id;
    record.editdate = Date.now();
    var imageBuffer;
    if(req.params.entity=="projects"){
      //record.last_git_check = Date.now();
      //build the similar projects query
      var similarQuery = {
        category: data.standard.category,
        $or: []
      };
      var tagList = data.standard.tags.split(",");
      for(var i=0;i<tagList.length;i++){
        similarQuery.$or.push({
          tags: {
            $regex: tagList[i].trim(),
            $options: "gi"
          }
        });
      }
    }

    if(data.special){
      //we have image data to deal with
      if(!fs.existsSync(attachmentDir+record._id.toString())){
        fs.mkdirSync(attachmentDir+record._id.toString());
      }
      if(data.special.markdown) {
        var linkStart = "//s3.amazonaws.com/" + envconfig.s3.bucket + "/";
        var markdown = record.content;
        var first = markdown.indexOf(linkStart);
        var count = 0;
        while (first >= 0) {
          var second = markdown.indexOf(")", first);
          first += linkStart.length;
          var previousFile = markdown.substring(first, second);
          // the assumption here is that previous will be
          // attachments/tmp/<file>
          var newFile = "attachments/" + record._id.toString() + "/content_" + count.toString() + previousFile.substring(previousFile.lastIndexOf("."));
          moveS3File(previousFile, newFile);
          markdown = markdown.substring(0,first) + newFile + markdown.substring(second);
          first = markdown.indexOf(linkStart,first+1);
        }
        record.content = markdown;
      }
      if(data.special.content) {
        var imageHandler = new ImageHandler(data.special.content);
        for (var i = 0; i < imageHandler.files.length; i++) {
          var contentFile = attachmentDir + record._id.toString() + "/content_" + i.toString() + "." + imageHandler.files[i].extension;
          fs.createReadStream(imageHandler.files[i].file).pipe(fs.createWriteStream(contentFile));
          var contentUrl = "/attachments/" + record._id.toString() + "/content_" + i.toString() + "." + imageHandler.files[i].extension;

          imageHandler.setSrc(imageHandler.files[i].id, contentUrl);
        }
        imageHandler.cleanupFiles();
        record.content = imageHandler.getSource();
      }
      if(data.special.image){
        //write the image to disk and store the Url
        imageBuffer = new Buffer(data.special.image.data, 'base64');
        fs.writeFile(attachmentDir+record._id.toString()+"/image.png", imageBuffer, function(err){
          if(err){
            console.log(err);
          }
        });
        record.image = "/attachments/"+record._id.toString()+"/image.png";
      }
      else{
        record.image = "/attachments/default/"+req.params.entity+".png";
      }
      if(data.special.thumbnail){
        //write the image to disk and store the Url
        imageBuffer = new Buffer(data.special.thumbnail.data, 'base64');
        fs.writeFile(attachmentDir+record._id.toString()+"/thumbnail.png", imageBuffer, function(err){
          if(err){
            console.log(err);
          }
        });
        record.thumbnail = "/attachments/"+record._id.toString()+"/thumbnail.png";
      }
      else{
        record.thumbnail = "/attachments/default/"+req.params.entity+".png";
      }
      MasterController.save(query, record, entities[req.params.entity], function(newrecord){
        if(!newrecord.errCode){
          //send an notification to all subscribers of the item
          Notifier.sendUpdateNotification(newrecord._id, newrecord, req.params.entity);
        }
        res.json(newrecord);
      });
    }
    else{
      if(isNew && imageEntities.indexOf(req.params.entity)!=-1){
        record.image = "/attachments/default/"+req.params.entity+".png";
        record.thumbnail = "/attachments/default/"+req.params.entity+".png";
      }
      MasterController.save(query, record, entities[req.params.entity], function(newrecord){
        if(!newrecord.errCode){
          if(isNew){
            //most likely a comment but we'll check anyway
            if(req.params.entity=="comment"){
              MasterController.get({}, {_id: newrecord.entityId}, entities[newrecord.entity], function(parent){
                if(!parent.errCode){
                  if(parent.data && parent.data[0]){
                    if(parent.data[0].userid._id != newrecord.userid._id){
                      Mailer.sendMail('create', "comment", {parent: parent.data[0], comment: newrecord}, function(){
                        //Notifier.sendCommentNotification(parent.data[0]._id, {parent: parent.data[0], comment:newrecord});
                      });
                    }
                    Notifier.sendCommentNotification(parent.data[0]._id, {parent: parent.data[0], comment:newrecord});
                  }
                }
              });
            }
          }
          else{
            //send an notification to all subscribers of the item
            Notifier.sendUpdateNotification(newrecord._id, newrecord, req.params.entity);

          }
        }
        res.json(newrecord);
      });
    }
  }
  else{
    res.json(Error.notLoggedIn());
  }
};

function hasProps(obj){
  for (var key in obj){
    if(obj.hasOwnProperty(key)){
      return true;  //the update query has a property
    }
  }
  return false;
}

var moveS3File = function(previousFile,newFile) {
  var previousWithBucket = envconfig.s3.bucket + "/" + previousFile;
  var params = {Bucket: envconfig.s3.bucket, CopySource: previousWithBucket, Key: newFile, ACL: "public-read"};
  var s3obj = new AWS.S3();
  s3obj.copyObject(params, function(err, result) {
    if(err) {
      console.error("Issue with S3 Copy", err);
    } else {
      var deleteParams = {Bucket: envconfig.s3.bucket, Key: previousFile};
      s3obj.deleteObject(deleteParams, function(err, result) {
        if (err) {
          console.error("Issue with S3 Delete", err);
        }
      });
    }
  });
};
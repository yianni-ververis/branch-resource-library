//These routes are for creating or updating records
var MasterController = require("../../controllers/master"),
    Error = require("../../controllers/error"),
    fs = require('fs'),
    attachmentDir = require("../../../attachmentDir"),
    entities = require("../entityConfig"),
    mongoose = require("mongoose"),
    epoch = require("milli-epoch"),
    atob = require("atob"),
    git = require("github"),
    GitCredentials = require("../../../gitCredentials"),
    GitHub = new git({
        // required
        version: "3.0.0",
        // optional
        debug: false,
        protocol: "https",
        host: "api.github.com", // should be api.github.com for GitHub
        pathPrefix: "", // for some GHEs; none for GitHub
        timeout: 5000,
        headers: {
            "user-agent": "qlik-branch" // GitHub is happy with a unique user agent
        }
    });

GitHub.authenticate({type: "token", token: GitCredentials.token });

module.exports = {
  create: function(req, res){
    //This route is for creating a new record on the 'Project' entity and returning the new record
    //Requires "create" permission on the 'Project' entity
    //This has been separated due to the nature of creating a 'Project'
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions['projects'];
    var data = req.body;
    if(!userPermissions || userPermissions.create!=true){
      res.json(Error.insufficientPermissions());
    }
    else{
      var record = data.standard || data;
      record._id = mongoose.Types.ObjectId();
      record.createuser = user._id;
      record.userid = user._id;
      record.createdate = Date.now();
      var imageBuffer;

      if(data.special){
        if(!fs.existsSync(attachmentDir+record._id.toString())){
          fs.mkdirSync(attachmentDir+record._id.toString());
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
        if(data.special.gitProject){
          console.log('need to get git project');
          GitHub.repos.get({user:data.special.gitProject.owner, repo:data.special.gitProject.repo}, function(err, gitresult){
            console.log('got project');
            record.last_updated = new Date(gitresult.updated_at);
            record.last_git_check = epoch.now();
            record.git_repo = data.special.gitProject.repo;
            record.git_user = data.special.gitProject.owner;
            record.project_site = gitresult.url;
            record.git_clone_url = gitresult.clone_url;
            GitHub.repos.getReadme({user:data.special.gitProject.owner, repo:data.special.gitProject.repo}, function(err, readmeresult){
              console.log('setting readme');
              record.content = atob(readmeresult.content);
              MasterController.save(null, project, entities['projects'], function(newrecord){
                res.json(newproject);
              });
            });
          });
        }
        else{
          MasterController.save(null, record, entities[req.params.entity], function(newrecord){
            res.json(newrecord);
          });
        }
      }
      else{
        MasterController.save(null, record, entities[req.params.entity], function(newrecord){
          res.json(newrecord);
        });
      }
    }
  },
  createProject: function(req, res){
    //This route is for creating a new record on the 'Project' entity and returning the new record
    //Requires "create" permission on the 'Project' entity
    //This has been separated due to the nature of creating a 'Project'
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions['projects'];
    var data = req.body;
    if(!userPermissions || userPermissions.create!=true){
      res.json(Error.insufficientPermissions());
    }
    else{
      var project = data.standard;
      project._id = mongoose.Types.ObjectId();
      project.createuser = user._id;
      project.userid = user._id;
      project.createdate = Date.now();
      var imageBuffer;

      if(data.special){
        if(!fs.existsSync(attachmentDir+project._id.toString())){
          fs.mkdirSync(attachmentDir+project._id.toString());
        }
        if(data.special.image){
          //write the image to disk and store the Url
          imageBuffer = new Buffer(data.special.image.data, 'base64');
          fs.writeFile(attachmentDir+project._id.toString()+"/image.png", imageBuffer, function(err){
            if(err){
              console.log(err);
            }
          });
          project.image = "/attachments/default/project.png";
        }
        else{
          project.image = "/attachments/default/project.png";
        }
        if(data.special.thumbnail){
          //write the image to disk and store the Url
          imageBuffer = new Buffer(data.special.thumbnail.data, 'base64');
          fs.writeFile(attachmentDir+project._id.toString()+"/thumbnail.png", imageBuffer, function(err){
            if(err){
              console.log(err);
            }
          });
          project.thumbnail = "/attachments/"+project._id.toString()+"/thumbnail.png";
        }
        else{
          project.thumbnail = "/attachments/default/project.png";
        }
        if(data.special.gitProject){
          console.log('need to get git project');
          GitHub.repos.get({user:data.special.gitProject.owner, repo:data.special.gitProject.repo}, function(err, gitresult){
            console.log('got project');
            project.last_updated = new Date(gitresult.updated_at);
            project.last_git_check = epoch.now();
            project.git_repo = data.special.gitProject.repo;
            project.git_user = data.special.gitProject.owner;
            project.project_site = gitresult.url;
            project.git_clone_url = gitresult.clone_url;
            GitHub.repos.getReadme({user:data.special.gitProject.owner, repo:data.special.gitProject.repo}, function(err, readmeresult){
              console.log('setting readme');
              project.content = atob(readmeresult.content);
              MasterController.save(null, project, entities['projects'], function(newproject){
                res.json(newproject);
              });
            });
          });
        }
        else{
          MasterController.save(null, project, entities['projects'], function(newproject){
            res.json(newproject);
          });
        }
      }
      else{
        MasterController.save(null, project, entities['projects'], function(newproject){
          res.json(newproject);
        });
      }
    }
  }
};

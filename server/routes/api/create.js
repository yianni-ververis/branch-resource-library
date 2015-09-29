//These routes are for creating or updating records
var MasterController = require("../../controllers/master"),
    Error = require("../../controllers/error"),
    fs = require('fs'),
    async = require('async'),
    _ = require('underscore'),
    attachmentDir = require("../../../attachmentDir"),
    entities = require("../entityConfig"),
    get = require(__dirname + "/get.js")
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
    //This route is for creating a new record on the specified entity and returning the new record
    //Requires "create" permission on the specified entity
    var entity = req.params.entity;
    var user = req.user;
    var userPermissions = req.user.role.permissions[entity];
    var data = req.body;
    if(!userPermissions || userPermissions.create!=true){
      res.json(Error.insufficientPermissions());
    }
    else{
      data.createuser = user._id;
      data.userid = user._id;
      data.dateline = Date.now;
      MasterController.save(null, data, entities[entity], function(result){
        res.json(result);
      });
    }
  },
  createProject: function(req, res){
    //This route is for creating a new record on the 'Project' entity and returning the new record
    //Requires "create" permission on the 'Project' entity
    //This has been separated due to the nature of creating a 'Project'
    var shared = {}
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
      if (!project.category) {
        project.category = {
          _id: ''
        }
      }

      if (!project.product) {
        project.product = {
          _id: ''
        }
      }

      if (!project.tags) {
        project.tags = []
      }

      async.series([
        function(next) {
          get.getProjects(req, res, function(projects) {
            shared.projects = projects
            async.eachSeries(shared.projects, function(item, next) {
              if (!item.category) {
                item.category = 'undefined'
              }
              
              if (!item.product) {
                item.product = 'undefined'
              }

              if (!item.tags) {
                item.tags = []
              }

              next()
            }, next)
          })
        },

        function(next) {
          shared.similar = shared.projects.filter(function(item) {
            return project.category._id.indexOf(item.category) !== -1 && project.product._id.indexOf(item.product) !== -1 && _.intersection(project.tags, item.tags).length > 0
          })

          project.similar = shared.similar.map(function(item) {
            return item._id
          })
          
          next()
        },

        function(next) {
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

          next()
        }

      ], function(err) {
        if(err) {
          console.log(err)
        }
      })
    }
  }
};

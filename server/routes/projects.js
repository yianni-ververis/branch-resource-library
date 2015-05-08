var express = require('express');
var router = express.Router();
var Projects = require('../controllers/project');
var Comments = require('../controllers/comment');
var GitHub = require('github');
var atob = require('atob');
var markdown = require('markdown').markdown;

var github = new GitHub({
    // required
    version: "3.0.0",
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    pathPrefix: "", // for some GHEs; none for GitHub
    timeout: 5000,
    headers: {
        "user-agent": "qlik-branch" // GitHub is happy with a unique user agent
    }
});

router.get('/', function(req, res){
  Projects.getAll(function(projects){
    console.log(projects);
    res.render('../server/views/projects/index.jade', {projects: projects})
  });
});

router.get('/detail/:id', function(req, res){
  Projects.get(req.params.id, function(project){
    //get the readme.md content for the specified project
    github.authenticate({type: "basic", username: "switchnick", password: "c0mp0und"});
    github.repos.getReadme({user: "brianwmunz", repo: "svgReader-qv11"}, function(err, result){
      if(err){
        console.log(err);
      }
      //get the comments for the specified project
      Comments.getProjectComments(project._id, function(comments){
        console.log(comments);
        res.render('../server/views/projects/detail.jade', {project: project, html:markdown.toHTML(atob(result.content)), comments: comments});
      });
    });
  })
});

router.get('/create', function(req, res){
  res.render('../server/views/projects/createProject.jade');
});

module.exports = router;

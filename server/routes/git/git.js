var express = require("express"),
    router = express.Router(),
    Project = require("../../models/project"),
    git = require("github"),
    atob = require("atob"),
    Auth = require("../../controllers/auth"),
    Error = require("../../controllers/error"),
    Config = require("../../../config"),
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

router.get("/updatereadme/:id", function(req, res){
  if(!req.user){
    res.json({errorCode: 401, errorText: "User not logged in", redirect: "#login"});
  }
  else{
    Project.findOne({_id: req.params.id}, function(err, result){
      if(err){
        res.json(Error.custom(err));
      }
      else{
        if(!result){
          res.json(Error.noRecord());
        }
        else {
          if(result.userid==req.user._id || req.user.role.name=="admin"){
            var repo = result.git_repo;
            var gituser = result.git_user;
            var parts = result.project_site.split("/");
            parts = parts.filter(Boolean);
            if(parts){
              if(!repo){  //if the repo has not been set correctly we'll grab it from the project_site.
                var repo = parts.pop();
                result.git_repo = repo;
                var gituser = parts.pop();        //chances are if the repo is bad then the owner is bad too        
                result.git_user = gituser;
              }
            }
            GitHub.authenticate({type: "token", token: Config.git.token });
            GitHub.repos.getReadme({user:gituser, repo:repo, headers:{accept: 'application/vnd.github.VERSION.raw'}}, function(err, readmeresult){
              if(err){
                console.log(err);
              }
              GitHub.authenticate({type: "token", token: Config.git.token });
              GitHub.markdown.renderRaw({data: readmeresult, mode: 'markdown'}, function(err, htmlresult){
                if(err){
                  console.log(err);
                  res.json(Error.custom(err));
                }
                else{
                  htmlresult = htmlresult.replace(/href="((?!http)[^>]*)"/gim, "href=\"https://github.com/"+gituser+"/"+repo+"/raw/master/$1\"")
                  htmlresult = htmlresult.replace(/src="((?!http)[^>]*)"/gim, "src=\"https://github.com/"+gituser+"/"+repo+"/raw/master/$1\"")
                  result.content = htmlresult;
                  result.save(function(err){
                    if(err){
                      console.log(err);
                    }
                  });
                  res.json(result || {});
                }
              });
            });
          }
          else {
            res.json(Error.insufficientPermissions());
          }
        }
      }
    });
  }
});

module.exports = router;

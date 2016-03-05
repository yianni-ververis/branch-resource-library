app.controller("discussionController", ["$rootScope","$scope", "$resource", "$state", "$stateParams", "userManager", "resultHandler", "notifications", "picklistService", function($rootScope, $scope, $resource, $state, $stateParams, userManager, resultHandler, notifications, picklistService){
  var Discussion = $resource("api/discussion/:discussionId", {discussionId: "@discussionId"});
  $scope.pageSize = 20;
  $scope.query = {};

  $scope.canAnswer = false;
  $scope.canReopen = false;

  $scope.discussions = [];

  $scope.discussionLoading = $stateParams.discussionId!="new";
  $rootScope.headTitle = "Discussions and Questions: Qlik Branch";
  $rootScope.metaKeys = "Branch, Qlik Branch, Forum, Discussions, Questions, Help, Qlik Sense, Qlik, Open Source";
  $rootScope.metaDesc = "Our Discussion section is a place for our community of web developers to ask questions and start conversations."
  
  $scope.isNew = $stateParams.discussionId=="new";

  var defaultSelection;

  if($state.current.name.indexOf('addedit')!=-1){
    $scope.threadHeading = $stateParams.discussionId=="new"? "New Thread" : "Edit Thread";
    $scope.discussions = [{}];
    $("#discussionContent").summernote({
      height: 400
    });
  }
  else{
    $scope.discussionId = $stateParams.discussionId;
    $scope.query.discussionId = $scope.discussionId;
  }

  $scope.markAnswered = function(id){
    var status = $scope.getStatusId("Answered");
    if(status){
      $scope.discussionLoading = true;
      Discussion.save({discussionId:id}, {status: status}, function(result){
        $scope.discussionLoading = false;
        if(resultHandler.process(result)){
          $scope.canAnswer = false;
          $scope.canReopen = true;
        }
        else{
          notifications.notify(result.errText, null, {sentiment: "negative"});
        }
      });
    }
    else{
      notifications.notify("Could not mark discussion as answered. Please contact the Branch admin team.", null, {sentiment:"negative"});
    }
  };

  $scope.reOpen = function(id){
    var status = $scope.getStatusId("Unanswered");
    if(status){
      $scope.discussionLoading = true;
      Discussion.save({discussionId:id}, {status: status}, function(result){
        $scope.discussionLoading = false;
        if(resultHandler.process(result)){
          $scope.canAnswer = true;
          $scope.canReopen = false;
        }
        else{
          notifications.notify(result.errText, null, {sentiment: "negative"});
        }
      });
    }
    else{
      notifications.notify("Could not reopen discussion. Please contact the Branch admin team.", null, {sentiment:"negative"});
    }
  };

  $scope.getStatusId = function(name){
    for (var i=0;i<$scope.discussionStatus.length;i++){
      if($scope.discussionStatus[i].name==name){
        return $scope.discussionStatus[i]._id;
      }
    }
    return null;
  };

  $scope.validateNewDiscussionData = function(){
    var errors = [];
    //Verify the discussion has a name
    if(!$scope.discussions[0].title || $scope.discussions[0].title==""){
      errors.push("Please specify a title");
    }
    if(!$scope.discussions[0].tags || $scope.discussions[0].tags==""){
      errors.push("Please specify at least one tag");
    }
    //Verify the discussion has content
    if($("#discussionContent").code().length==12){  //this is not necessarily robust. a length of 12 appears to be an empty input
      errors.push("Please add some content");
    }
    //If there are errors we need to notify the user
    if(errors.length > 0){
      //show the errors
      notifications.notify("The discussion could not be saved. Please review the following...", errors, {sentiment: "warning"});
      window.scrollTo(100,0);
    }
    else{
      //Save the record
      $scope.saveDiscussion();
    }
  };

  $scope.saveDiscussion = function(){
    $scope.discussionLoading = true;
    $scope.discussions[0].content = $("#discussionContent").code();
    $scope.discussions[0].plaintext = cleanUpContent($scope.discussions[0].content);
    var query = {};
    if($scope.discussions[0]._id){
      query.discussionId = $scope.discussions[0]._id;
    }
    Discussion.save(query, $scope.discussions[0], function(result){
      $scope.discussionLoading = false;
      if(resultHandler.process(result)){
        var status = $scope.isNew ? "created" : "updated";
        window.location = "#discussion/"+result._id+"?status="+status;
      }
      else{
        notifications.notify(result.errText, null, {sentiment: "negative"});
      }
    });
  };

  $scope.getDiscussionData = function(query, append){
    Discussion.get(query, function(result){
      $scope.discussionLoading = false;
      if(resultHandler.process(result)){
        if(result.data && result.data.length > 0){
          
          $rootScope.headTitle = result.data[0].title + " by " + result.data[0].userid.username + ": Discussions on Qlik Branch";
          $rootScope.metaKeys = result.data[0].tags;
          $rootScope.metaDesc = result.data[0].status.name + " discussion: " + result.data[0].title;
            
          if($stateParams.status){
            if($stateParams.status=='created'){
              notifications.notify("Your discussion has been successfully created.", null, {sentiment:"positive"});
            }
            else if ($stateParams.status=='updated') {
              notifications.notify("Your discussion has been successfully updated. It may take up to 5 minutes for the listing page to reflect these changes.", null, {sentiment:"positive"});
            }
          }
          if(append && append==true){
            $scope.discussions = $scope.discussions.concat(result.data);
          }
          else{
            $scope.discussions = result.data;
            //if this is the detail view we'll update the breadcrumbs
          }
          if($state.current.name=="forum.addedit"){
            $("#discussionContent").code(_arrayBufferToBase64(result.data[0].content.data));
          }
          $scope.discussionInfo = result;
          $scope.canAnswer = ($scope.discussions[0].userid._id == $scope.currentuserid) && ($scope.discussions[0].status.name=="Unanswered");
          $scope.canReopen = ($scope.discussions[0].userid._id == $scope.currentuserid) && ($scope.discussions[0].status.name=="Answered");
          delete $scope.discussionInfo["data"];
        }
        else{
          window.location = "#noitem";
        }
      }
    });
  };

  $scope.getDiscussionContent = function(text){
    if(text && text.data){
      var buffer = _arrayBufferToBase64(text.data);
      return marked(buffer);
    }
    else{
      return "";
    }
  };

  $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams){
    if(fromState.name.split(".")[0]==toState.name.split(".")[0]){ //then we should clear the search state
       if(toState.name.split(".").length==1){ //we only need to do this if we're on a listing page
        searchExchange.publish("executeSearch");
       }
    }
    if(toState.name!="loginsignup"){
      searchExchange.view = toState.name.split(".")[0];
    }
    if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
      searchExchange.clear(true);
    }
    defaultSelection = [];
    if($state.current.name=="forum.detail"){
      picklistService.getPicklistItems("Discussion Status", function(items){
        $scope.discussionStatus = items;
      });
      userManager.refresh(function(hasUser){
        $scope.currentuserid = userManager.userInfo._id;
        $scope.getDiscussionData($scope.query); //get initial data set
      });
    }
    else if($state.current.name=="forum.addedit"){
      picklistService.getPicklistItems("Discussion Status", function(items){
        $scope.discussionStatus = items;
      });
      var hasUser = userManager.hasUser();
      if(!hasUser){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            window.location = "#login?url=discussion/"+$stateParams.discussionId+"/edit"
          }
          else{
            if($stateParams.discussionId!="new"){
              $scope.getDiscussionData($scope.query); //get initial data set
            }
          }
        });
      }
      else{
        if($stateParams.discussionId!="new"){
          $scope.getDiscussionData($scope.query); //get initial data set
        }
      }
    }
    else{ //this should be the list page
      if(!userManager.hasUser()){
        userManager.refresh(function(hasUser){
          if(!hasUser){
            defaultSelection = [{
              field: "approved",
              values: [{qText: "True"}]
            }]
          }
          else{
            if(!userManager.canApprove('discussion')){
              defaultSelection = [{
                field: "approved",
                values: [{qText: "True"}]
              }]
            }
          }
          searchExchange.subscribe('reset', "forum", function(){
            searchExchange.init(defaultSelection);
            searchExchange.unsubscribe('reset', "forum");
          });
          if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
            searchExchange.clear(true);
          }
        });
      }
      else{
        if(!userManager.canApprove('discussion')){
          defaultSelection = [{
            field: "approved",
            values: [{qText: "True"}]
          }]
        }
        searchExchange.subscribe('reset', "forum", function(){
          searchExchange.init(defaultSelection);
          searchExchange.unsubscribe('reset', "forum");
        });
        if((fromState.name.split(".")[0]!=toState.name.split(".")[0]) || fromState.name=="loginsignup"){
          searchExchange.clear(true);
        }
      }
    }
  });

  function _arrayBufferToBase64( buffer ) {
    var binary = '';
    var bytes = new Uint8Array( buffer );
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode( bytes[ i ] );
    }
    return binary ;
  }

  function cleanUpContent(text){
    var noImg = text.replace(/<img[^>]*>/g,"[image]");
    noHTML = noImg.replace(/<\/?[^>]+(>|$)/g, "");
    return noHTML;
  }

}]);

var mailer = require('./emailer'),
    MasterController = require("./master"),
    entities = require("../routes/entityConfig"),
    Subscriptions = entities["subscriptions"],
    GlobalConfig = require("../../config.js");

module.exports = {
  sendUpdateNotification: function(entityId, record, entity){
    //we only do this if the item is currently approved
    if(!record.approved){
      return;
    }

    var options = {
      subject: "Branch Item Updated",
      html: "<p>The item " + record.title + " has been updated.</p><p>To view the updated item, click <a href='http://"+GlobalConfig.host+"/#/"+entity+"/"+entityId+"'>here</a></p>"
    }
    //update notifications go to all users that have subscribed to the item
    MasterController.get({}, {entityId: entityId}, Subscriptions, function(list){
      if(list && list.data && list.data.length > 0){
        //send an email to each subscriber
        list.data.forEach(function(item, index){
          console.log(item.userid.email);
          options.to = "nwr@qlik.com";
          // mailer.sendMail(options, function(){
          //
          // });
        });
      }
    })
  }
}

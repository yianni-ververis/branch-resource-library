var mailer = require('./emailer'),
    MasterController = require("./master"),
    entities = require("../routes/entityConfig"),
    Subscriptions = entities["subscription"],
    GlobalConfig = require("../../config.js");

module.exports = {
  sendUpdateNotification: function(entityId, record, entity){
    //we only do this if the item is currently approved
    if(!record.approved){
      return;
    }

    //update notifications go to all users that have subscribed to the item
    MasterController.get({}, {entityId: entityId}, Subscriptions, function(list){
      if(list && list.data && list.data.length > 0){
        //send an email to each subscriber
        list.data.forEach(function(item, index){
          mailer.sendMail("update", "subscription", record, function(){

          });
        });
      }
    })
  },
  sendCommentNotification: function(entityId, record){
    //we only do this if the item is currently approved
    if(record.parent.approved==false){
      return;
    }
    //update notifications go to all users that have subscribed to the item
    MasterController.get({}, {entityId: entityId}, Subscriptions, function(list){
      if(list && list.data && list.data.length > 0){
        //send an email to each subscriber
        list.data.forEach(function(item, index){
          mailer.sendMail("update", "subscriptionComment", record, function(){

          });
        });
      }
    })
  }
}

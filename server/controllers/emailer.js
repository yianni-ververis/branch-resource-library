config = require('../../config.js');
nodemailer = require('nodemailer').createTransport(config.mailTransport);
Templater = require('./templater');
MailText = require('./mailText');

module.exports = {
  sendMail: function(action, entity, data, callbackFn){
    var templateOptions = MailText[action][entity];
    if(templateOptions){
      var toTemplate = new Templater(templateOptions.to);
      var subjectTemplate = new Templater(templateOptions.subject);
      var htmlTemplate = new Templater(templateOptions.html);
      var mailOptions = {
        from: 'Qlik Branch <branchadmin@qlik.com>',
        to: toTemplate.getHTML(data),
        subject: subjectTemplate.getHTML(data),
        html: htmlTemplate.getHTML(data)
      }
      console.log(mailOptions);
      nodemailer.sendMail(mailOptions, function(error, info){
        if(error){
          return console.log(error)
        }
        else{
          console.log('Message sent: ' + info.response);
          callbackFn.call(null);
        }
      });
    }
    else{
      console.log('no mail template found for '+action+"/"+entity);
    }
  },
  sendCustomMail: function(mailOptions, callbackFn){
    nodemailer.sendMail(mailOptions, function(error, info){
      if(error){
        return console.log(error)
      }
      else{
        console.log('Message sent: ' + info.response);
        callbackFn.call(null);
      }
    });
  }
}

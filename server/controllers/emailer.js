config = require('../../config.js');
nodemailer = require('nodemailer').createTransport(config.mailTransport);
Templater = require('./templater');
MailText = require('./mailText');

module.exports = {
  sendMail: function(action, entity, data, callbackFn){
    var templateOptions = MailText[action][entity];
    //var emailHTMLHeader = '<style>font-family:Arial,sans-serif;font-size:12px;</style><img src="/resources/qlik-typemarks/QlikBranchTypemark-Horizontal-Web.png" height="50" width="267" border="0"><br><br>';
    if(templateOptions){
      var toTemplate = new Templater(templateOptions.to);
      var subjectTemplate = new Templater(templateOptions.subject);
      var htmlTemplate = new Templater(templateOptions.html);
      var mailOptions = {
        from: 'Qlik Branch <svc-branchadminmail@qlik.com>',
        to: 'Brian Munz <brianwmunz@gmail.com>',
        subject: subjectTemplate.getHTML(data),
        html: MailText["mailTemplate"]["header"].html + htmlTemplate.getHTML(data)
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

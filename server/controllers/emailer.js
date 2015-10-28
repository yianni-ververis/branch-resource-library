nodemailer = require('nodemailer').createTransport();
Templater = require('./templater');
MailText = require('./mailText');

module.exports = {
  sendMail: function(action, entity, data, callbackFn){
    var templateOptions = MailText[action];
    var mailOptions = {
      from: 'Qlik Branch <branchadmin@qlik.com>',
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    }
    console.log(mailOptions);
    // nodemailer.sendMail(mailOptions, function(error, info){
    //   if(error){
    //     return console.log(error)
    //   }
    //   else{
    //     console.log('Message sent: ' + info.response);
    //     callbackFn.call();
    //   }
    // });
  }
}

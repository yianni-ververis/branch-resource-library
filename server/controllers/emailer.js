nodemailer = require('nodemailer').createTransport();

module.exports = {
  sendMail: function(options, callbackFn){
    var mailOptions = {
      from: 'Qlik Branch <branchadmin@qlik.com>',
      to: options.to,
      subject: options.subject,
      html: options.html
    }

    nodemailer.sendMail(mailOptions, function(error, info){
      if(error){
        return console.log(error)
      }
      else{
        console.log('Message sent: ' + info.response);
        callbackFn.call();
      }
    });
  }
}

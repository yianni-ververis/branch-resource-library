module.exports = {
  signup:{
    user:{
      to: "{{email}}",
      subject: "Welcome to Branch",
      html: "Hi {{username}} and welcome to Branch and Qlik Playground!<br />One log in, two very cool resources, just for you!  We’re happy you’re here.  By now you might know that Branch is Qlik’s <a href='http://branch.qlik.com'>Open Source</a> community.<br />Open Source isn’t just a term for us.  We practice all aspects of open; including <a href='https://github.com/Qlik-Branch/branch-resource-library/issues'>bug fixes and functionality</a> improvements for Branch that’s also an <a href='http://branch.qlik.com/#!/project/5672a4ef2a6e57d03cd9b783'>open source project</a>.  If you’re new to our tech you’re probably wondering how to easily get started, and for that, look no further than Playground.<br /><a href='http://playground.qlik.com'>Playground</a> is a free coding environment that opens our core technology and engine along with awesome public <a href='http://www.twitter.com'>Twitter</a>, <a href='http://www.github.com'>GitHub</a>, and <a href='http://www.untappd.com'>Untappd</a> (beer application) data to use in any application you create.<br />Looking for some inspiration?  Hundreds of open source <a href='http://branch.qlik.com/#!/project'>projects</a> have already been created on using our technology by Qlik users.  Have a look at our projects page on <a href='http://branch.qlik.com'>Branch</a> for ideas and to see what’s already been done!<br />As you begin your journey with <a href='http://branch.qlik.com'>Branch</a> and Playground, we will be supporting you with <a href='http://branch.qlik.com/#!/resource'>resources</a> and excellent communication.  Our <a href='https://medium.com/qlik-branch'>blog</a> is regularly updated with useful and relevant content; after all, our technology is built by developers for developers.<br />You can access both Qlik Branch and Playground with your single ID and password.  So now that you know where to find everything, let’s get coding!  And don’t forget to let us know if you need anything.<br /><br />Happy Coding!<br />The Qlik Branch Team"
    }
  },
  create:{
    comment:{
      to: "{{parent.userid.email}}",
      subject: "New Activity on {{parent.title}}",
      html: "Hi {{parent.userid.username}},<br> There is new Activity on <strong>\"{{parent.title}}\":</strong><br/><br/>{{comment.userid.username}} said:<br/>{{comment.plaintext}}<br/><br/>Please <a href='http://branch.qlik.com/#!/{{comment.entity}}/{{parent._id}}'>click here</a> to view the comment on Qlik Branch."
    }
  },
  unapprove:{
    userprofile:{
      to: "{{email}}",
      subject: "Branch User Blocked",
      html: "The user {{username}} on branch.qlik.com has been blocked with the following comments - <br/><p>{{hide_comment}}</p>"
    },
    project:{
      to: "{{userid.email}}",
      subject: "Branch Project Rejected",
      html: "Unfortuantely, the project named <strong>{{title}}</strong> has been rejected with the following comments - <br/><p>{{hide_comment}}</p>"
    }
  },
  update:{
    subscription:{
      to: "{{subscription.userid.email}}",
      subject: "{{record.title}} has been updated",
      html: "Hi {{subscription.userid.username}}, <br/>The project <strong>{{record.title}}</strong> has been updated in Github."
    },
    subscriptionComment:{
      to: "{{subscription.userid.email}}",
      subject: "Someone has commented on {{record.parent.title}}",
      html: "Hi {{subscription.userid.username}}, <br/>The following comment was just posted on {{record.parent.title}}:<br />{{record.comment.plaintext}}<br/><br/>You received this email because you are subscribed to this project for updates.  To unsubscribe, please visit the project page and click the 'Unsubscribe' button."
    }
  },
  mailTemplate:{
    header:{
      html: "<!doctype html><html><head><meta name='viewport' content='width=device-width'><meta http-equiv='Content-Type' content='text/html; charset=UTF-8'><title>Qlik Branch Email</title><style>* {font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;  font-size: 14px;color:#838383;line-height: 1.6em;  margin: 0;  padding: 0;} h2{font-size:20px;}</style></head><body><img src='http://branch.qlik.com/resources/qlik-typemarks/QlikBranchTypemark-Horizontal-Web.png' alt='Qlik Branch Logo' height='44' width='267' border='0'><br><br>"
    },
    footer:{
      html:"</body></html>"
    }
  }
}

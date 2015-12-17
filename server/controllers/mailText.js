module.exports = {
  signup:{
    user:{
      to: "{{email}}",
      subject: "Welcome to Branch",
      html: "Hi {{username}}, thank you for joining Qlik Branch!<br /><br /><img src='http://branch.qlik.com/resources/branch_logo.png' align='right' height='175' width='175'/>Qlik Branch is a place for developers to learn, collaborate, and share projects with like-minded people.  <br/>To get started, why not check out our <a href='http://branch.qlik.com/#/project'>Projects</a> page to see the latest projects being shared in the community?  If you have a question, feel free to post it in our <a href='http://branch.qlik.com/#/discussion'>Forum</a> or join our public <a href='http://qlikbranch-slack-invite.herokuapp.com/'>Slack</a> channel.  You can also keep up to date with the latest news and articles in our <a href='http://branch.qlik.com/#/blog'>Blog section.</a><br/><br/>There is much more to come, so thanks again for joining us!<br/><br/>Nick, Alex, and Brian<br/><strong>The Qlik Branch Team</strong>"
    }
  },
  create:{
    comment:{
      to: "{{parent.userid.email}}",
      subject: "New Activity on {{parent.title}}",
      html: "Hi {{parent.userid.username}},<br> There is new Activity on <strong>\"{{parent.title}}\":</strong><br/><br/>{{comment.userid.username}} said:<br/>{{comment.plaintext}}<br/><br/>Please <a href='http://branch.qlik.com/#/{{comment.entity}}/{{parent._id}}'>click here</a> to view the comment on Qlik Branch."
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

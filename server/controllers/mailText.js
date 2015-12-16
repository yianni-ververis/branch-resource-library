module.exports = {
  signup:{
    user:{
      to: "{{email}}",
      subject: "Welcome to Branch",
      html: "{{username}}, thank you for joining the Branch community."
    }
  },
  create:{
    comment:{
      to: "{{parent.userid.email}}",
      subject: "New Activity on {{parent.title}}",
      html: "New Activity on <strong>{{parent.title}}</strong><br/>{{comment.plaintext}}"
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
      html: "The project <strong>{{title}}</strong> has been rejected with the following comments - <br/><p>{{hide_comment}}</p>"
      //html: "Project {{title}} on branch.qlik.com has been rejected with the following comments.<br /><p>{{hide_comment}}</p>"
    }
  },
  update:{
    subscription:{
      to: "{{subscription.userid.email}}",
      subject: "{{record.title}} has been updated",
      html: "The project <strong>{{record.title}}</strong> has been updated"
    },
    subscriptionComment:{
      to: "{{subscription.userid.email}}",
      subject: "Someone has commented on {{record.parent.title}}",
      html: "{{record.comment.plaintext}}"
    }
  },
  mailTemplate:{
    header:{
      html: "<style>font-family:Arial,sans-serif;font-size:12px;color:pink;</style><img src='http://branch-test.qlik.com/resources/qlik-typemarks/QlikBranchTypemark-Horizontal-Web.png' alt='Qlik Branch Logo' height='50' width='267' border='0'><br><br>"
    },
    footer:{
      html:""
    }
  }
}

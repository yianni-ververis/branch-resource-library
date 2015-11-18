module.exports = {
  signup:{
    user:{
      to: "DL-PartnerEngineering",
      subject: "Welcome to Branch",
      html: "{{username}}, thank you for joining the Branch community."
    }
  },
  create:{
    comment:{
      to: "DL-PartnerEngineering",
      subject: "New Activity on {{parent.title}}",
      html: "{{comment.content}}"
    }
  },
  unapprove:{
    userprofile:{
      to: "DL-PartnerEngineering",
      subject: "Branch User Blocked",
      html: "The user x on branch.qlik.com has been blocked blah blah blah"
    },
    project:{
      to: "DL-PartnerEngineering",
      subject: "Branch Project Rejected",
      html: "Please do not be alarmed, this is a test. You're project hasn't really been rejected"
      //html: "Project {{title}} on branch.qlik.com has been rejected with the following comments.<br /><p>{{hide_comment}}</p>"
    }
  },
  update:{
    subscription:{
      to: "DL-PartnerEngineering",
      subject: "{{title}} has been updated",
      html: "Some relevant text here"
    },
    subscriptionComment:{
      to: "DL-PartnerEngineering",
      subject: "Someone has commented on {{parent.title}}",
      html: "{{comment.content}}"
    }
  }
}

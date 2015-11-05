module.exports = {
  signup:{
    user:{
      to: "nwr@qlik.com",
      subject: "Welcome to Branch",
      html: "{{username}}, thank you for joining the Branch community."
    }
  },
  create:{
    comment:{
      to: "nwr@qlik.com",
      subject: "New Activity on {{parent.title}}",
      html: "{{comment.content}}"
    }
  },
  unapprove:{
    userprofile:{
      to: "nwr@qlik.com",
      subject: "Branch User Blocked",
      html: "The user x on branch.qlik.com has been blocked blah blah blah"
    },
    project:{
      to: "nwr@qlik.com",
      subject: "Branch Project Rejected",
      html: "Project {{title}} on branch.qlik.com has been rejected with the following comments.<br /><p>{{hide_comment}}</p>"
    }
  },
  update:{
    subscription:{
      to: "nwr@qlik.com",
      subject: "{{title}} has been updated",
      html: "Some relevant text here"
    },
    subscriptionComment:{
      to: "nwr@qlik.com",
      subject: "Someone has commented on {{parent.title}}",
      html: "{{comment.content}}"
    }
  }
}

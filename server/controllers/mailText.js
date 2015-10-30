module.exports = {
  unapprove:{
    user:{
      to: "nwr@qlik.com",
      subject: "Branch User Blocked",
      html: "The user x on branch.qlik.com has been blocked blah blah blah"
    },
    project:{
      to: "nwr@qlik.com",
      subject: "Branch Project Rejected",
      html: "Project {{title}} on branch.qlik.com has been rejected blah blah blah"
    }
  }
}

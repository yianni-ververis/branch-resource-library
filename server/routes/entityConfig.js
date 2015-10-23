module.exports = {
    users:{
      collection: "users",
      model: require("../models/user"),
      populates: "role",
      exemptFromOwnership: false,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        username: 1
      },
      limit: 10,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    projects:{
      collection: "projects",
      model: require("../models/project"),
      populates: "userid category product status",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: true,
      sort: {
        dateline: -1
      },
      limit: 20,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    blogs:{
      collection: "blogs",
      model: require("../models/blog"),
      populates: "userid",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: true,
      sort: {
        dateline: -1
      },
      limit: 20,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    ratings: {
      collection: "ratings",
      model: require("../models/rating"),
      populates: "userid",
      requiresAuthentication: true,
      exemptFromOwnership: false,
      exemptFromApproval: true,
      logViews: false,
      limit: 10,
    },
    subscriptions: {
      collection: "subscriptions",
      model: require("../models/subscription"),
      populates: "userid",
      requiresAuthentication: true,
      exemptFromOwnership: false,
      exemptFromApproval: true,
      logViews: false,
      limit: 10,
    },
    views: {
      collection: "views",
      model: require("../models/views"),
      populates: "userid",
      requiresAuthentication: false,
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      limit: 10,
    },
    articles:{
      collection: "articles",
      model: require("../models/article"),
      populates: "userid",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: true,
      sort: {
        dateline: -1
      },
      limit: 10,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    comments:{
      collection: "comments",
      model: require("../models/comment"),
      populates: "userid",
      exemptFromOwnership: false,
      exemptFromApproval: false,
      logViews: false,
      sort: {
        dateline: -1
      },
      limit: 10,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    userroles:{
      collection: "userroles",
      model: require("../models/userrole"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: true    //only applies to GET requests. All other requests MUST be authenticated
    },
    features:{
      collection: "features",
      model: require("../models/feature"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    projectcategories:{
      collection: "projectcategories",
      model: require("../models/projectcategory"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    products:{
      collection: "products",
      model: require("../models/product"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    picklists: {
      collection: "picklists",
      model: require("../models/picklist"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: false
    },
    picklistitems: {
      collection: "picklistitems",
      model: require("../models/picklistitem"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: false
    },
    flags: {
      collection: "flags",
      model: require("../models/flag"),
      populates: "",
      exemptFromOwnership: true,
      exemptFromApproval: true,
      logViews: false,
      sort: {
        name: 1
      },
      requiresAuthentication: true
    }
};

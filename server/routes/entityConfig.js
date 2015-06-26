module.exports = {
    users:{
      collection: "users",
      model: require("../models/user"),
      populates: "role",
      exemptFromOwnership: false,
      sort: {
        username: 1
      },
      limit: 100,
      requiresAuthentication: true    //only applies to GET requests. All other requests MUST be authenticated
    },
    projects:{
      collection: "projects",
      model: require("../models/project"),
      populates: "",
      exemptFromOwnership: false,
      sort: {
        dateline: -1
      },
      limit: 100,
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    },
    userroles:{
      collection: "userroles",
      model: require("../models/userrole"),
      populates: "",
      exemptFromOwnership: true,
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
      sort: {
        name: 1
      },
      requiresAuthentication: false    //only applies to GET requests. All other requests MUST be authenticated
    }
};

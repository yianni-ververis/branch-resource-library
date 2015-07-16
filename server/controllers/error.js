module.exports = {
  custom: function(customText){
    return{
      errCode: -1,
      errText: (customText || "")
    }
  },
  noRecord: function(customText){
    return{
      errCode: 0,
      errText: "No record found. " + (customText || "")
    }
  },
  insufficientPermissions: function(customText){
    return {
      errCode: 1,
      errText: "Insufficient Permissions. " + (customText || "")
    }
  },
  notLoggedIn: function(customText){
    return {
      errCode: 2,
      errText: "User not logged in. " + (customText || "")
    }
  },
  errorSaving: function(customText){
    return {
      errCode: 3,
      errText: "Could not save record. " + (customText || "")
    }
  },
  errorGetting: function(customText){
    return {
      errCode: 4,
      errText: "Could not get requested data. " + (customText || "")
    }
  },
  errorDeleting: function(customText){
    return {
      errCode: 5,
      errText: "Could not delete record. " + (customText || "")
    }
  }
}

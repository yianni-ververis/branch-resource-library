var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var UserRoleSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  permissions:{
    default: {}
    //example
    // project:{
    //   allOwners: false,
    //   create: true,
    //   read: true,
    //   update: true,
    //   delete: false
    // }
  },
  edituser: {
    type: Schema.ObjectId,
    ref: 'users'
  },
  createuser: {
    type: Schema.ObjectId,
    ref: 'user'
  }
});

module.exports = mongoose.model('userrole', UserRoleSchema);

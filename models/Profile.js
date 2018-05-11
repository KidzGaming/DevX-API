const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  handle: {
    type: String,
    required: true
  },
  githubUrl: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Profile = module.exports = mongoose.model('Profile', ProfileSchema);
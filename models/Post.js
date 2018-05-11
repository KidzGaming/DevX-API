const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  profilePicture: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String
  }
});

const Profile = module.exports = mongoose.model('Profile', ProfileSchema);
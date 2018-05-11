const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProfileSchema = new Schema({});

const Profile = module.exports = mongoose.model('Profile', ProfileSchema);
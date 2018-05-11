const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  githubUrl: {
    type: String,
    required: true
  }
});

const Organization = module.exports = mongoose.model('Organization', OrganizationSchema);
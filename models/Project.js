const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  languages: {
    type: Array,
    required: true,
    default: []
  },
  team: {
    type: Array,
    required: true,
    default: []
  }
});

const Project = module.exports = mongoose.model('Project', ProjectSchema);
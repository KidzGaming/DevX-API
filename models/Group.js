const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GroupSchema = new Schema({});

const Group = module.exports = mongoose.model('Group', GroupSchema);
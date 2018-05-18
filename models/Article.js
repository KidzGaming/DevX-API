const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  headline: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    required: true,
    default: []
  },
  date:{
    type: Date,
    default: Date.now,
    required: true
  }
});

const Article = module.exports = mongoose.model('Article', ArticleSchema);
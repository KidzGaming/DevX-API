const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: 'Post'
  },
  text: {
    type: String,
    required: true
  }
}, { timestamps: true });

const Comment = module.exports = mongoose.model('Comment', CommentSchema);
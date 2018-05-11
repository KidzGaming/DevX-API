const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tokenId: {
    type: String,
    required: true
  }
});

const Token = module.exports = mongoose.model('Token', TokenSchema);
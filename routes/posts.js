const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  Post.find({}, (err, posts) => {
    if(err){
      res.status(400).json({ success: false, msg: 'Unable to fetch posts from database.', err: err });
    } else {
      res.status(200).json({ success: true, posts: posts });
    }
  });
});

module.exports = router;
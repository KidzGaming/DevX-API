const express = require('express');
const router = express.Router();

router.get('/feed', (req, res) => {
  let feed = [];
  if(!req.user._id){
    res.status(500).send();
  } else {
    User.find({}, (err, users) => {
      if(err){
        res.status(400).json({ success: false, msg: 'Could not fetch posts from database.' });
      } else {
        users.forEach(user => {
          const condition = user.followers.includes(req.user._id);
          if(condition == true){
            Post.find({ author: user._id}, (err, posts) => {
              if(err){
                res.status(400).json({ success: false, msg: 'Couldn\'t fetch user\'s posts!' });
              } else {
                feed.push(posts);
                console.log(feed);
                res.status(200).json({ success: true, feed: feed });
              }
            }).sort({ date: -1 });
          }
        });
      }
    });
  }
});

module.exports = router;
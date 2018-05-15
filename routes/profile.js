const express = require('express');
const router = express.Router();

let User = require('../models/User');
let Profile = require('../models/Profile');
let Post = require('../models/Post');
let UserSettings = require('../models/UserSettings');
let Portfolio = require('../models/Portfolio');

// Get all user info (plus profile) by username
router.get('/:username', (req, res) => {
  const { username } = req.params;
  Profile.findOne({ handle: username }, (err, profile) => {
    User.findById(profile.userId, (err, user) => {
      Post.find({ author: user._id }, (err, posts) => {
        UserSettings.findOne({ userId: user._id }, (err, settings) => {
          Portfolio.findById(profile.userId, (err, portfolio) => {
            if(err){
              res.status(400).json({ success: false, msg: 'Unable to fetch profile information. Please make sure you provided the right username.'});
            } else {
              res.status(200).json({ profile: { user: user, posts: posts, settings: settings }});
            }
          });
        });
      });
    });
  });
});

module.exports = router;
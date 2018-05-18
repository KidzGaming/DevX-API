const express = require('express');
const router = express.Router();

// Bring in required models
let Group = require('../models/Group');

router.get('/', (req, res) => {
  Group.find({}, (err, groups) => {
    if(err){
      res.status(400).json({ success: false, msg: 'Unable to fetch groups. Please try again later.' });
    } else {
      res.status(200).json({ success: true, groups: groups });
    }
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();

// Bring in Article Model
let Article = require('../models/Article');

// Bring in User Model
let User = require('../models/User');

// Add Submit POST Route
router.post('/publish', (req, res) => {
  const { headline, author, concept, excerpt } = req.body;
  let article = new Article();
  article.headline = headline;
  article.author = req.user._id;
  article.featuredImage = req.body.featuredImage;
  article.date = Date.now();
  article.content = content;
  article.excerpt = excerpt;

  article.save((err) => {
    if(err){
      res.status(400).json({ success: false, msg: 'Unable to publish article.' });
    } else {
      res.status(200).json({ success: true, msg: 'Article successfully created!' });
    }
  });
});

// Update Submit POST Route
router.post('/edit/:id', (req, res) => {
  const { id } = req.params;
  const { headline, content, excerpt } = req.body;
  let article = {};
  article.headline = headline;
  article.featuredImage = req.body.featuredImage;
  article.content = content;
  article.excerpt = excerpt;

  Article.update({ _id: id }, article, (err) => {
    if(err){
      console.log(err);
      return;
    } else {
      req.flash('success', 'Article Updated!');
      res.redirect('/home');
    }
  });
});

// Delete Article
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  if(!req.user._id){
    res.status(500).send();
  }
  Article.findById(id, (err, article) => {
    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      Article.remove({ _id: id }, (err) => {
        if(err){
          res.status(400).json({ success: false, msg: 'Unable to delete article.' });
        } else {
          res.status(200).json({ success: true, msg: 'Article successfully deleted.'});
        }
      });
    }
  });
});

router.post('/:id/clap', (req, res) => {
  const { id } = req.params;
  Article.findById(id, (err, article) => {
    if(err){
      res.status(400).json({ success: false, msg: 'Unable to fetch article from database.' });
    } else {
      article.claps = article.claps + 1;
      article.save((err) => {
        if(err){
          res.status(400).json({ success: false, msg: 'Unable to add clap for post.' });
        }
      });
    }
  });
});

// Get Single Article
router.get('/:id', (req, res) => {
  const { id } = req.params;
  Article.findById(id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.status(200).json({ article:article, author: user.fullname, content: article.content });
    });
  });
});

module.exports = router;
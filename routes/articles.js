const express = require('express');
const router = express.Router();

// Bring in Article Model
let Article = require('../models/Article');

// Bring in User Model
let User = require('../models/User');

// Add Submit POST Route
router.post('/publish', function(req, res){

  // Get Errors
  let errors = req.validationErrors();

  if(errors){
    res.render('publish', {
      title:'Publish an Article',
      errors:errors
    });
  } else {
    let article = new Article();
    article.headline = req.body.headline;
    article.author = req.user._id;
    article.featuredImage = req.body.featuredImage;
    article.date = Date.now();
    article.content = req.body.content;
    article.excerpt = req.body.excerpt;

    article.save(function(err){
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success','Article Added!');
        res.redirect('/home');
      }
    });
  }
});

// Load Edit Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  const { id } = req.params;
  Article.findById(id, (err, article) => {
    if(article.author != req.user._id){
      req.flash('danger', 'You are not authorized to edit this article.');
      res.redirect('/home');
    } else if(err) {
      res.status(400).json({ success: false, msg: 'Unable to fetch profile information. Please make sure you provided the right username.'});
    } else {
      res.status(200).json({ article: article });
    }
  });
});

// Update Submit POST Route
router.post('/edit/:id', (req, res) => {
  let article = {};
  article.headline = req.body.headline;
  article.featuredImage = req.body.featuredImage;
  article.content = req.body.content;
  article.excerpt = req.body.excerpt;

  let query = { _id:req.params.id }

  Article.update(query, article, (err) => {
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
  let query = {_id:id}
  Article.findById(id, (err, article) => {
    if(article.author != req.user._id){
      res.status(500).send();
    } else {
      Article.remove(query, (err) => {
        if(err){
          console.log(err);
        }
        res.send('Success!');
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

// Access Control
function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('danger', 'Please create an account or log in');
    res.redirect('/users/login');
  }
}

module.exports = router;
const express = require('express');
const router = express.Router();

// Bring in required models
let Post = require('../models/Post');
let Comment = require('../models/Comment');

router.get('/', (req, res) => {
  Post.find({}, (err, posts) => {
    if(err){
      res.status(400).json({ success: false, msg: 'Unable to fetch posts from database.', err: err });
    } else {
      res.status(200).json({ success: true, posts: posts });
    }
  });
});

router.post('/new', (req, res) => {
  const { text } = req.body;
  if(!req.user._id){
    res.status(500).json({ success: false, msg: 'Please log in or sign up.' });
  } else {
    let newPost = new Post();
    newPost.text = text;
    newPost.author = req.user._id;
    newPost.save((err) => {
      if(err){
        res.status(400).json({ success: false, msg: 'Unable to add post.' });
      }
    });
    res.status(200).json({ success: true, post: newPost });
    console.log(req.user);
  }
});

router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  if(!req.user._id){
    res.status(500).json({ success: false, msg: 'Please log in or sign up.' });
  } else {
    Post.findById(id, (err, post) => {
      if(err){
        res.status(400).json({ success: false, msg: 'Unable to fetch post' });
      } else {
        post.likes.push(req.user._id);
        post.save((err) => {
          if(err){
            res.status(400).json({ success: false, msg: 'Unable to like post.' });
          }
        });
      }
    });
  }
});

router.post('/:id/unlike', (req, res) => {
  const { id } = req.params;
  if(!req.user._id){
    res.status(500).json({ success: false, msg: 'Please log in or sign up.' });
  } else {
    Post.findOne({_id:id}, (err, post) => {
      if(err){
        res.status(400).json({ success: false, msg: 'Unable to find post.' });
      } else {
        const index = post.likes.indexOf(req.user._id);
        if(index > -1 ){
          post.likes.splice(index, 1);
          post.save((err) => {
            if(err){
              res.status(400).json({ success: false, msg: 'Unable to unlike post.' });
            }
          });
        }
      }
    });
  }
});

router.get('/:id/comments', (req, res) => {
  const { id } = req.params;
  Comment.find({post:id}, (err, comments) => {
    if(err){
      res.status(400).json({ success: false, msg: 'Unable to fetch comments.' });
    } else {
      res.status(200).json({ success: true, comments: comments });
    }
  });
});

router.post('/:id/comments/new', (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if(!req.user._id){
    res.status(500).json({ success: false, msg: 'Please log in or sign up.' });
  } else {
    Post.findById(id, (err, post) => {
      if(err){
        res.status(400).json({ success: false, msg: 'Unable to get post from database.' });
      } else {
        let newComment = new Comment();
        newComment.author = req.user._id;
        newComment.post = id;
        newComment.text = text;
        newComment.save((err) => {
          if(err){
            res.status(400).json({ success: false, msg: 'Unable to add comment.' });
          }
        });
        post.comments.push(newComment._id);
        post.save((err) => {
          if(err){
            res.status(200).json({ success: false, msg: 'Unable to add comment.' });
          }
        });
      }
    });
  }
});

module.exports = router;
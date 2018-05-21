const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Bring in User Model
let User = require('../models/User');
let Profile = require('../models/Profile');
let UserSettings = require('../models/UserSettings');
let Portfolio = require('../models/Portfolio');
let Token = require('../models/Token');

// Register Process
router.post('/register', function(req, res){
  const { firstname, lastname, email, username, password, confirmpassword } = req.body;
  const fullname = `${firstname} ${lastname}`;

  User.findOne({ email:email }, (err, user) => {
    if(!user){
      let newUser = new User({
        firstname:firstname,
        lastname:lastname,
        fullname:fullname,
        email:email,
        username:username,
        password:password
      });
  
      bcrypt.genSalt(10, function(err, salt){
        bcrypt.hash(newUser.password, salt, function(err, hash){
          if(err){
            console.log(err);
          }
          newUser.password = hash;
          newUser.save((err) => {
            if(err) {
              return res.status(500).send({ msg: err.message });
            }
  
            // Create user profile
            const newProfile = new Profile({
              userId: newUser._id,
              handle: newUser.username,
            });
            
            // Save user profile
            newProfile.save((err) => {
              if(err){
                return res.status(500).json({ msg: `The following error occured: ${err}`});
              }
            });
            
            // Create profile settings for user
            const newUserSettings = new UserSettings({
              userId: newUser._id
            });
        
            // Save user's profile settings
            newUserSettings.save((err) => {
              if(err){
                return res.status(500).json({ msg: `The following error occured: ${err}`});
              }
            });
  
            // Create portfolio for user
            const newPortfolio = new Portfolio({
              userId: newUser._id
            });
        
            // Save user's profile settings
            newPortfolio.save((err) => {
              if(err){
                return res.status(500).json({ msg: `The following error occured: ${err}`});
              }
            });
  
            // Create verification token for this user
            const newToken = new Token({ userId: newUser._id, token: crypto.randomBytes(16).toString('hex') });
  
            // Save the verification token
            newToken.save((err) => {
              if(err){
                return res.status(500).send({ msg: err.message });
              }
  
              // Send the mail
              const transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: process.env.GMAIL_ADDRESS, pass: process.env.GMAIL_PASSWORD } });
              const mailOptions = { from: process.env.GMAIL_ADDRESS, to: newUser.email, subject: 'Verify your Tension Account', text: 'Hello, ' + newUser.firstname + ' ' + newUser.lastname + '\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/users\/confirmation\/' + newToken.token + '.\n'};
              transporter.sendMail(mailOptions, function (err) {
                if(err){
                  return res.status(500).send({ msg: err.message });
                }
                // Redirect the user to the email verification information page.
                res.status(200).json({ success: true, msg: `An email has been sent to ${newUser.email} with a link to verify your email address. If not found in your mailbox, check your spam or trash folder.` })
              });
            });
          });
        });
      });
    } else {
      res.status(200).json({ success: false, msg: 'Another user is registered with this email address.' });
    }
  });
});

router.get('/confirmation/:token', function(req, res){
  const { token } = req.params;

  // Find a matching token
  Token.findOne({ token: token }, function(err, token){
    if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token may have expired.' });

    // If a token is found, find amatching user
    User.findOne({ _id: token.userId }, function(err, user){
      if(!user) {
        return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
      }
      if(user.isVerified){
        return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });
      }

      // Verify and save the user
      user.isVerified = true;
      user.save(function (err) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }
        res.redirect('/account-verified');
      });
    });
  });
});

// Resend token (if expired)
router.post('/resend', function (req, res) {
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  // Check for validation errors    
  let errors = req.validationErrors();
  if (errors) return res.status(400).send(errors);

  User.findOne({ email: req.body.email }, function (err, user) {
    if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
    if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });

    // Create a verification token, save it, and send email
    const token = new Token({ userId: user._id, token: crypto.randomBytes(16).toString('hex') });

    // Save the token
    token.save(function (err) {
      if(err){ 
        return res.status(500).send({ msg: err.message }); 
      }

      // Send the email
      const transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: process.env.GMAIL_ADDRESS, pass: process.env.GMAIL_PASSWORD } });
      const mailOptions = { from: 'Tension', to: user.email, subject: 'Verify your Tension account', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/users\/confirmation' + token.token + '.\n' };
      transporter.sendMail(mailOptions, function (err) {
        if(err){ return res.status(500).send({ msg: err.message }); }
        res.status(200).send(`A verification email has been sent to ${user.email}`);
      });
    });
  });
});

// Login Process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// logout
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');
});

router.post('/:username/follow', (req, res) => {
  const { username } = req.params;
  if(!req.user._id){
    res.status(500).send();
  } else {
    User.findOne({ username: username }, (err, user) => {
      if(err){
        res.status(400).json({ success: false, msg: 'Could not fetch user from database.' });
      } else {
        user.followers.push(req.user._id);
        user.save((err) => {
          if(err){
            res.status(400).json({ success: false, msg: 'Could not follow user!' });
          }
        });
      }
    });
  }
});

router.post('/:username/unfollow', (req, res) => {
  const { username } = req.params;
  if(!req.user._id){
    res.status(500).send();
  } else {
    User.findOne({ username: username }, (err, user) => {
      if(err){
        res.status(400).json({ success: false, msg: 'Could not fetch user from database.' });
      } else {
        const index = user.followers.indexOf(req.user._id);
        if(index > -1){
          user.followers.splice(index, 1);
          user.save((err) => {
            if(err){
              res.status(400).json({ success: false, msg: 'Could not follow user!' });
            }
          });
        }
      }
    });
  }
});

module.exports = router;
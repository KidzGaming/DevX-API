require('dotenv').load();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const expressValidator = require('express-validator');
const passport = require('passport');
const config = require('./config/database');
const port = process.env.PORT || 3500;
// const multer = require('multer');
const formidable = require('formidable');
const fs = require('fs');

mongoose.connect(config.database, {
  useMongoClient: true,
});
let db = mongoose.connection;

// Check connection
db.once('open', () => {
  console.log('Connected to MongoDB!');
});

// Check for DB errors
db.on('error', (err) => {
  console.log(err);
});

// Initialize app
const app = express();

// Bring in Models
let Article = require('./models/Article');
let File = require('./models/File');
let Post = require('./models/Post');

// Body Parser Middleware
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});


// Home Route
app.get('/', (req, res) => {
  res.status(200).json({ success: true, msg: 'Welcome to DevX!' });
});

// Upload POST Route
app.get('/upload', (req, res) => {
  res.render('upload');
});

app.post('/images/upload', (req, res) => {
  // Create an incoming form object
  const form = new formidable.IncomingForm();

  // Specify that we want to allow the user to upload multiple files
  form.multiples = true;

  // Store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/public/uploads');

  // Every time a file has been uploaded successfully,
  // rename it to its original name
  form.on('file', (field, file) => {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    let newFile = new File({ filename: file.name });
    newFile.save((err) => {
      if(err){
        console.log(err);
        return;
      } else {
        req.flash('success', 'You have successfully added your image to the database!');
        res.redirect('/');
      }
    })
  });

  // Log any errors that occur
  form.on('error', (err) => {
    console.log('An error has occured: \n' + err);
  });

  // Once all the files have been uploaded, send a response to the client
  form.on('end', () => {
    res.end('success');
  });

  // Parse the incoming request containing the form data
  form.parse(req);
});

// Home Route
app.get('/home', (req, res) => {
  Post.find({}, (err, posts) => {
    Article.find({}, (err, articles) => {
      if(err){
        res.status(400).json({ success: false, msg: 'Unable to fetch posts and articles from the database.'})
      } else {
        res.status(200).json({ success: true, posts:posts, articles:articles });
      }
    });
  });
});

// Email Verification Confirmation Page
app.get('/email-verify', (req, res) => {
  res.status(200).json({ success: true, msg: ''});
});

// Email Verified Confirmation Page
app.get('/account-verified', (req, res) => {
  res.status(200).json({ success: true, msg: 'Your account has been verified, please log in.'});
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
let profile = require('./routes/profile');
let groups = require('./routes/groups');
let projects = require('./routes/projects');
let posts = require('./routes/posts');
app.use('/articles', articles);
app.use('/users', users);
app.use('/profile', profile);
app.use('/groups', groups);
app.use('/projects', projects);
app.use('/posts', posts);

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });

// Start Server
app.listen(port, () => {
  console.log(`Server started at port ${port}.`);
});
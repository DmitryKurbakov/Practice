/**
*Module dependencies
*/
var
  express = require('express'),
  passport = require('../config/passport'),
  utilities = require('../models/utilities'),
  fs = require('fs'),
  json2html = require('node-json2html');
//==============================================================================
/**
*Create router instance
*/
var router = express.Router();
//==============================================================================
/**
*Module Variables
*/
//needed to protect the '/dashboard' route
function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/dashboard');
}

var
  errHandler = utilities.errHandler,
  validationErr = utilities.validationErr,
  cr8NewUser = utilities.cr8NewUser,
  findUser = utilities.findUser,
  viewAllUsers = utilities.viewAllUsers,
  updateUser = utilities.updateUser,
  deleteUser = utilities.deleteUser;
//==============================================================================
/**
*Middleware
*/
router.use(passport.initialize());
router.use(passport.session());
//==============================================================================
/**
*Routes
*/
//---------------------------Test route-----------------------------------------
router.get('/test', function (req, res) {
  return res.send('<marquee><h1>Welcome to the test page</h1></marquee>');
});
//---------------------------App routes-----------------------------------------
// router.get('/', function (req, res) {
//   return res.render('pages/signin');
// });

//dashboard login test
router.route('/dash').get(function (req, res) {
    return res.render('pages/dbtest', {
        username: req.user.username,
        email: req.user.email
    });
});

router.route('/')
  .get(function (req, res) {
    return res.render('pages/signin');
  })
  .post(function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
      if (err) {
        return next(err); // will generate a 500 error
      }
      if (!user) {
        return res.status(409).render('pages/signin', {errMsg: info.errMsg});
      }
      req.login(user, function(err){
        if(err){
          console.error(err);
          return next(err);
        }
        return res.redirect('/dashboard');
          //return res.render();
      });
    })(req, res, next);
  });

router.route('/signup')
  .get(function (req, res) {
    return res.render('pages/signup');
  })
  .post(function(req, res, next) {
    passport.authenticate('local-signup', function(err, user, info) {
      if (err) {
        return next(err); // will generate a 500 error
      }
      if (!user) {
        return res.status(409).render('pages/signup', {errMsg: info.errMsg});
      }
      req.login(user, function(err){
        if(err){
          console.error(err);
          return next(err);
        }
        return res.redirect('/dashboard');
      });
    })(req, res, next);
  });

router.get('/dashboard', isLoggedIn, function (req, res) {
  return res.render('pages/dashboard', {
    username: req.user.username,
    email: req.user.email
    });
});

router.post('/response', function (req, res) {

    var data = JSON.parse(req.body.about);

    console.log(data);

    var render = require('render-quill');

    render(data, function(err, output){
        fs.writeFile('myhtml.html', output , 'utf8');
        console.log("callback: " + output)
    });

    return res.send(data);

});

router.get('/logout', function (req, res) {
  req.logout();
  req.session.destroy();
  return res.redirect('/');
});
//---------------------------API routes-----------------------------------------
router.get('/api/users', function (req, res) {
  return viewAllUsers(req, res);
});

router.route('/api/users/:email')
  .get(function (req, res) {
    return findUser(req, res);
  })
  .put(function (req, res) {
    return update(req, res);
  })
  .delete(function (req, res) {
    return deleteUser(req, res);
  });
//==============================================================================
/**
*Export Module
*/
module.exports = router;
//==============================================================================

/**
*Module dependencies
*/
var
  express = require('express'),
  passport = require('../config/passport'),
  utilities = require('../models/utilities'),
  dbutilities = require('../dbutilities/dbutilities');
//==============================================================================
//DB
var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

var collection;
var cursor;

var render = require('render-quill');
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

    MongoClient.connect('mongodb://localhost:27017/xpressLocalAuth', function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection('news');

        cursor = collection.find({"name" : "news"});
        cursor.each(function(err, doc) {
            if(err)
                throw err;
            if(doc == null)
                return;

            db.close();
            return res.render('pages/dashboard', {
                items: doc.items
            });
        });
    });
});

router.get('/news-create', function (req, res) {
    return res.render('pages/news-create');
});

var temp;

router.get('/news-edit', function (req, res) {
    MongoClient.connect('mongodb://localhost:27017/xpressLocalAuth', function(err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");
        collection = db.collection('news');

        cursor = collection.find({"name" : "news"});
        cursor.each(function(err, doc) {
            if(err)
                throw err;
            if(doc == null)
                return;

            db.close();

            for (var i = 0; i < doc.items.length; i++){
                if (parseInt(doc.items[i].id) === parseInt(temp)){
                    var title = doc.items[i].title;
                    return res.render('pages/news-edit', { title: title, num: "../../news/" + temp + ".ejs" });
                }
            }
        });
    });


});

router.post('/edit-response', function (req, res) {

    temp = req.body.case;
    return res.redirect('/news-edit');
});

router.post('/delete-response', function (req, res) {
    dbutilities.deleteRaws(req.body.items);
});

router.post('/response', function (req, res) {

    var data = JSON.parse(req.body.about);
    var head = req.body.head;

    console.log(data);

    render(data, function(err, output){
        dbutilities.writeNews(output, head);
        console.log("callback: " + output);
    });

    return res.send(data);

});

router.post('/upd-raw', function (req, res) {

    var data = JSON.parse(req.body.about);
    var head = req.body.head;

    console.log(data);

    render(data, function(err, output){
        dbutilities.updateRaw(temp, output, head);
        console.log("callback: " + output);
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

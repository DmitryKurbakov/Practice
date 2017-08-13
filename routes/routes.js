/**
 *Module dependencies
 */
var
    express = require('express'),
    passport = require('../config/passport'),
    utilities = require('../models/utilities'),
    dbutilities = require('../dbutilities/dbutilities'),
    responseHandler = require('../dbutilities/responses-handlers');
//==============================================================================
//DB
var news,
    articles;
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
    if (req.isAuthenticated()) {
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
    .post(function (req, res, next) {
        passport.authenticate('local-login', function (err, user, info) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.status(409).render('pages/signin', {errMsg: info.errMsg});
            }
            req.login(user, function (err) {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                return res.redirect('/news/dashboard');
                //return res.render();
            });
        })(req, res, next);
    });

router.route('/signup')
    .get(function (req, res) {
        return res.render('pages/signup');
    })
    .post(function (req, res, next) {
        passport.authenticate('local-signup', function (err, user, info) {
            if (err) {
                return next(err); // will generate a 500 error
            }
            if (!user) {
                return res.status(409).render('pages/signup', {errMsg: info.errMsg});
            }
            req.login(user, function (err) {
                if (err) {
                    console.error(err);
                    return next(err);
                }
                return res.redirect('/news/dashboard');
            });
        })(req, res, next);
    });

router.get('/news/dashboard', isLoggedIn, function (req, res) {
    responseHandler.dashboardHandler('news', res);
});

router.get('/articles/dashboard', isLoggedIn, function (req, res) {
    responseHandler.dashboardHandler('articles', res);
});

router.get('/news/create', function (req, res) {
    return res.render('pages/create');
});

router.get('/articles/create', function (req, res) {
    return res.render('pages/create');
});

router.post('/news/create-response', function (req, res) {
    responseHandler.createResponseHandler(req, res, 'news');
});

router.post('/articles/create-response', function (req, res) {
    responseHandler.createResponseHandler(req, res, 'articles');
});

router.post('/news/edit-response', function (req, res) {

    news = req.body.case;
    return res.redirect('/news/edit');
});

router.post('/articles/edit-response', function (req, res) {

    articles = req.body.case;
    return res.redirect('/articles/edit');
});

router.get('/news/edit', function (req, res) {
    responseHandler.editResponseHandler('news', news, res);
});

router.get('/articles/edit', function (req, res) {
    responseHandler.editResponseHandler('articles', articles, res);
});

router.post('/news/upd-raw', function (req, res) {
    responseHandler.updRawResponseHandler(req, res, news, 'news');
});

router.post('/articles/upd-raw', function (req, res) {
    responseHandler.updRawResponseHandler(req, articles, 'articles');
});


router.post('/delete-response', function (req, res) {
    dbutilities.deleteRaws(req.body.items, 'news');
});

router.post('/articles-delete-response', function (req, res) {
    dbutilities.deleteRaws(req.body.items, 'articles');
});

router.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy();
    return res.redirect('/');
});

router.get('/news', function (req, res) {
    dbutilities.getNews().then(function (r) {
        return res.render('pages/news.ejs', {
            items: r
        });
    });
});

router.get('/news/:id', function (req, res) {
    console.log(req.params.id);
    dbutilities.getNews(req.params.id).then(function (r) {
        console.log('Blya' + r);
        return res.render('../' + r.path, {
            item: r
        });
    });
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

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
        responseHandler.signIn(passport, req, res, next);
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
    responseHandler.updRawResponseHandler(req, res, articles, 'articles');
});

router.post('/news/delete-response', function (req, res) {
    dbutilities.deleteRaws(req.body.items, 'news');
});

router.post('/articles/delete-response', function (req, res) {
    dbutilities.deleteRaws(req.body.items, 'articles');
});

router.post('/news/public-response', function (req, res) {
    dbutilities.publishRaws(req.body.items, 'news');
});

router.post('/articles/public-response', function (req, res) {
    dbutilities.publishRaws(req.body.items, 'articles');
});

router.get('/logout', function (req, res) {
    req.logout();
    req.session.destroy();
    return res.redirect('/');
});

router.get('/apply', function (req, res) {
    return res.render('pages/proposal-create.ejs');
});

var fs = require('fs');

var multer  = require('multer');

var upload = multer({ dest: 'news/' });

router.post('/submit-proposal', upload.single('uploadedFile'), function (req, res) {
    console.log(req.body.company);

    console.log(req.body);

    console.log(req.file);

    var data = req.body;
    data.fileName = req.file.filename;

    dbutilities.writeProposals(data);

    res.redirect('/news');
});

router.get('/proposals', function (req, res) {
    res.render('pages/proposals');
});

router.get('/proposals-export', function (req, res) {
    responseHandler.proposalsExportResponseHandler(req, res);
});

router.get('/news', function (req, res) {
    responseHandler.themesResponseHandler(res, 'news');
});

router.get('/articles', function (req, res) {
    responseHandler.themesResponseHandler(res, 'articles');
});

router.get('/news/:id', function (req, res) {
    responseHandler.themeResponseHandler(req, res, 'news');
});

router.get('/articles/:id', function (req, res) {
    responseHandler.themeResponseHandler(req, res, 'articles');
});

router.get('/worksheet', function (req, res) {
    var path = require('path');
    return res.sendFile(path.resolve(__dirname + '/../public/sample.docx'));
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

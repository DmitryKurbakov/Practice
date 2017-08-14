

var dbutilities = require('../dbutilities/dbutilities');


var render = require('render-quill');

function dashboardHandler(theme, res) {

    dbutilities.getItems(theme).then(function (result) {
        return res.render('pages/dashboard', {
            items : result,
            theme : '/' + theme
        })
    })
}

function createResponseHandler(req, res, theme) {
    var data = JSON.parse(req.body.about);
    var head = req.body.head;

    console.log(data);

    render(data, function (err, output) {
        dbutilities.writeNews(output, head, theme);
        console.log("callback: " + output);
    });

    return res.send(data);
}

function editResponseHandler(theme, num, res) {
    dbutilities.getTitle(theme, num).then(function (result) {
        return res.render('pages/edit', {
            title : result,
            num : "../../" + theme + "/" + num + ".ejs"
        })
    });
}

function updRawResponseHandler(req, res, num, theme) {
    var data = JSON.parse(req.body.about);
    var head = req.body.head;

    console.log(data);

    render(data, function (err, output) {
        dbutilities.updateRaw(num, output, head, theme);
        console.log("callback: " + output);
    });

    return res.send(head);
}

function signIn(passport, req, res, next) {

    dbutilities.checkDatabase('news');
    dbutilities.checkDatabase('articles');

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
}

function themesResponseHandler(res, theme) {
    dbutilities.getNews(theme).then(function (r) {
        return res.render('pages/themes', {
            items : r,
            theme : theme
        });
    });
}

function themeResponseHandler (req, res, theme) {
    console.log(req.params.id);
    dbutilities.getNews(theme, req.params.id).then(function (r) {
        console.log('Blya' + r);
        return res.render('../' + r.path, {
            item: r
        });
    });
}

module.exports = {
    dashboardHandler : dashboardHandler,
    createResponseHandler : createResponseHandler,
    editResponseHandler : editResponseHandler,
    updRawResponseHandler : updRawResponseHandler,
    themesResponseHandler : themesResponseHandler,
    themeResponseHandler : themeResponseHandler,
    signIn : signIn
};


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

    return res.send(data);
}

module.exports = {
    dashboardHandler : dashboardHandler,
    createResponseHandler : createResponseHandler,
    editResponseHandler : editResponseHandler,
    updRawResponseHandler : updRawResponseHandler
};
/**
 *Module dependencies
 */
var
    app = require('./app'),
    https = require('https');
    fs = require('fs');

//==============================================================================
var options = {
    key: fs.readFileSync('./SSL/key.pem'),
    cert: fs.readFileSync('./SSL/cert.pem'),
    requestCert: false,
    rejectUnauthorized: false
};
/**
 *Create server instance
 */
var server = https.createServer(options, app);


//==============================================================================
/**
 *Module Variables
 */
//==============================================================================
var
    port = app.get('port'),
    env = app.get('env');
/**
 *Bind server to port
 */
//==============================================================================
server.listen(port, function () {
    return console.log('Xpress server listening on port:' + port +' in ' + env +
        ' mode');
});
//==============================================================================
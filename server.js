/**
 * Created by drakon on 27.07.16.
 */
const
    url             = require('url'),
    express         = require('express'),
    port            = 8080,
    bodyParser      = require('body-parser'),
    //  logger = require('morgan'),
    cookieSessions  = require('cookie-sessions'),
    view            = require('./controllers/view'),
    db              = require('./controllers/db');

var app = express() //connect()
    //.use(logger('combined'))
    //.use(connect.static('public'))
    //.use(cookieParser())
    .use(cookieSessions({
        name: 'session',
        secret: 'Secret'
    }))
    .use(bodyParser.urlencoded({  extended: true   }))
    .use(bodyParser.json())
    //.use(function(req, res){ res.end(JSON.stringify(req.body));  })


    .use('/fonts/',        view.page('view/statics/fonts'))
    .use('/css/',          view.page('view/statics/css'))
    .use('/js/',           view.page('view/statics/js'))

    .use('/src',           db.mapping)

    .use('/',              db.checkSession)
    .use('/',              db.login)
    .use('/logout',        db.logout)
    .use('/loginData.js',  db.loginData)
    .use('/',              view.page('view','view/statics'));



function start() {
    app.listen(port);
    console.log("Server has started.");
}
exports.start = start;




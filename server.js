process.env.NODE_ENV = process.env.NODE_ENV || 'development';
port = 3001;
var express = require('express'),
morgan = require('morgan'),
bodyParser = require('body-parser'),
session = require('express-session'),
methodOverride = require('method-override'),
cookieParser = require('cookie-parser'),
path = require('path'),
flash = require('connect-flash'),
connect = require('connect')
passport = require('passport');
var io      = require("socket.io");
var easyrtc = require("easyrtc"); 

var http    = require("http");  
var app = express();

// Enable logger (morgan)
//    app.use(morgan('dev'));

/*cosas generales*/
var
        // Local ip address that we're trying to calculate
        address
        // Provides a few basic operating-system related utility functions (built-in)
        , os = require('os')
        // Network interfaces
        , ifaces = os.networkInterfaces();


// Iterate over interfaces ...
for (var dev in ifaces) {
    // ... and find the one that matches the criteria
    var iface = ifaces[dev].filter(function(details) {
        return details.family === 'IPv4' && details.internal === false;
    });

    if (iface.length > 0)
        address = iface[0].address;
}
if (typeof address == 'undefined') {
    address = '127.0.0.1';
}
// Use Express middlewares
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

//app.use(bodyParser.urlencoded());
//app.use(bodyParser.json());
app.use(methodOverride());
app.use(cookieParser());
app.use(session({
    secret: 'MEAN'
}));

// Set view engine
app.set('views', __dirname + '/app/views');

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.set('ipaddr', address);
app.set('port', port);
// app.enable('jsonp callback');
// Connect flash for flash messages
app.use(flash());

app.use(connect.multipart());   

// Init Passport 
app.use(passport.initialize());
app.use(passport.session());

// Bootstrap application

// Start Express http server on port 
var webServer = http.createServer(app).listen(port);

// Start Socket.io so it attaches itself to Express server
var socketServer = io.listen(webServer, {"log level":1});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer);

// Configure routing
require('./app/routes')(app, express,socketServer);

// Setting the app router and static folder
app.use(express.static(path.resolve('./public')));

// Bootstrap passport config
var passport = require('./config/passport')();

// Tell developer about it
console.log('Server running at http://:' + app.get('ipaddr') + ':' + app.get('port'));
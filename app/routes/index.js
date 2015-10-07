

module.exports = function(app, express, socketServer) {
    var controllers = require('../controllers');
    app.route('/').get(controllers.user.IndexPage);

    app.all('*', function(req, res, next) {

        res.header("Access-Control-Allow-Origin", "*");

        res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');

        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

        if ('OPTIONS' == req.method) {
            return res.send(200);
        }
        next();
    });
    require('./users.server.routes')(app, express, controllers);
    require('./email')(app, express, controllers);
    require('./chat.server')(app, express, controllers, socketServer);
    require('./ftp.server.router')(app, express, controllers, socketServer);
};
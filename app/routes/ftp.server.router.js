module.exports = function(app, express, controllers,io) {
// API email
	authorization	= require('./middlewares/authorization');
    var ftp = express.Router();
    ftp.route('/api')
            .post(controllers.ftp.AddFtpServer)
    ftp.route('/api/:parms')
            .get(controllers.ftp.GetFtps)
            .delete(controllers.ftp.DeleteFTP)

    app.use('/ftp', ftp);
};
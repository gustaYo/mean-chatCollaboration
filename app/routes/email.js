module.exports = function(app, express, controllers) {
// API email
	authorization	= require('./middlewares/authorization');
    var emailController = controllers.email;
    var emaill = express.Router();

    emaill.route('/api')
            .post(authorization.requiresLogin,emailController.insertEmail)
    emaill.route('/api/:parms')
            .get(authorization.requiresLogin,emailController.EmailsUser)
            .delete(authorization.requiresLogin,emailController.DeleteEmailUser)

    app.use('/email', emaill);
};
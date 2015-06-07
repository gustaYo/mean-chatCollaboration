passport = require('passport');

module.exports = function(app, express, controllers) {
    users = controllers.user;
    // Setting up the local authentication
// API USER

    authorization = require('./middlewares/authorization');
    var user = express.Router();
    user.route('/signup').post(users.signup);
    user.route('/signin').post(users.signin);
    user.route('/signout').get(users.signout);
    user.route('/filter_user/:filter').get(users.filter_user);
    user.route('/getusers').get(users.getAllUsers);
    // Setting the facebook oauth routes
    user.route('/facebook').get(passport.authenticate('facebook', {
        scope: ['email']
    }));
    user.route('/facebook/callback').get(users.oauthCallback('facebook'));
    app.use('/auth', user);
};
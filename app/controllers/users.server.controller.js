'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        passport = require('passport'),
        User = mongoose.model('User');

/**
 * Filter_user
 */
exports.filter_user = function(req, res) {
    var regex = new RegExp(req.params.filter, "i")
            , query = {email: regex};

    User
            .find(query)
            .select({email: 1, _id: 0})
            .limit(10)
            .exec(function(err, users) {
                if (err) {
                    res.json(err);
                }
                var restorn = new Array();
                for (var i in users) {
                    restorn.push(users[i].email)
                }
                res.json(restorn);
            });
}

/**
 * Signout
 */
exports.getAllUsers = function(req, res) {
    User.find(function(err, users) {
        if (err)
            res.send(500, err.message);
        res.status(200).jsonp(users);
    });
};

/**
 * Get the error message from error object
 */
var getErrorMessage = function(err) {
    var message = '';
    if (err.code) {
        switch (err.code) {
            case 11000:
            case 11001:
                message = 'Username already exists';
                break;
            default:
                message = 'Something went wrong';
        }
    } else {
        for (var errName in err.errors) {
            if (err.errors[errName].message)
                message = err.errors[errName].message;
        }
    }

    return message;
};

/**
 * Signout
 */
exports.signout = function(req, res) {
    res.clearCookie('user');
    res.clearCookie('pass');
    req.logout();
    res.redirect('/');
};

/**
 * Signup
 */
exports.signup = function(req, res) {
    // Init Variables
    var user = new User(req.body);
    var message = null;

    // Add missing user fields
    user.provider = 'local';

    // Then save the user 
    user.save(function(err) {
        if (err) {
            return res.send(400, {
                message: getErrorMessage(err)
            });
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;

            req.login(user, function(err) {
                if (err) {
                    res.send(400, err);
                } else {
                    res.jsonp(user);
                }
            });
        }
    });
};

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
    var record = req.body.recordar;
    passport.authenticate('local', function(err, user, info) {
        if (err || !user) {
            res.send(400, info);
        } else {
            // Remove sensitive data before login
            user.password = undefined;
            user.salt = undefined;
            req.login(user, function(err) {
                if (err) {
                    res.send(400, err);
                } else {
                    if (typeof record !== 'undefined' && record == true) {
                        console.log('session redordada')
                        res.cookie('user', req.body.username, {maxAge: 900000});
                        res.cookie('pass', req.body.password, {maxAge: 900000});
                    }
                    res.jsonp(user);
                }
            });
        }
    })(req, res, next);
};

/**
 * OAuth callback
 */
exports.oauthCallback = function(strategy) {
    return function(req, res, next) {
        passport.authenticate(strategy, function(err, user, redirectURL) {
            if (err || !user) {
                return res.redirect('/#!/signin');
            }
            req.login(user, function(err) {
                if (err) {
                    return res.redirect('/#!/signin');
                }

                return res.redirect(redirectURL || '/');
            });
        })(req, res, next);
    };
};
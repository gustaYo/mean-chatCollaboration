'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
        passport = require('passport'),
        User = mongoose.model('User');

// user example
var UsersExamples = function(num) {
    User.find(function(err, users) {
        if (err) {
            console.log(err)
        } else {
            if (users.length == 0) {
                var usersTEST = new Array();
                for (var i = 0; i < num; i++) {
                    var userTest = {
                        "salt": " 7a�fލ㑌\u000e�Ϥ4_",
                        "email": 'user' + i + '@uci.cu',
                        "password": "XmWsXvey0wePqTrs2UEBlh4uxYyPWqcyCUMtSrYmadU2RXKTjnMauDdAa+0WE15tdm5NPEMObBY0WldnU2jGEg==",
                        "provider": "local",
                        "username": 'user' + i,
                        "peti": [],
                        "grups": [
                            {
                                "name": "Contacts",
                                "users": [],
                                "open": true
                            }
                        ],
                        "convAbiertas": [
                            "all"
                        ],
                        urlimg: "img/avatars/usuario.jpg",
                        "created": Date.now
                    };
                    usersTEST.push(userTest)
                }
//                async.mapLimit(myArray, 10, function(document, next) {
//                    document.save(next);
//                }, done);
                User.collection.insert(usersTEST, function(callback) {
                    console.log('insertados ' + num + ' users test pass 1234567')
                })
            }
        }
    });
}
UsersExamples(500);

/**
 * Filter_user
 */
exports.IndexPage = function(req, res) {
    if (typeof req.user != 'undefined') {
        User
                .findOne({username: req.user.username})
                .populate(
                {
                    path: 'grups.users',
                    select: '-password -salt'
                })
                .populate(
                {
                    path: 'peti',
                    select: '-password -salt -peti'
                })
                .exec(function(err, userp) {
            res.render('index', {
                user: JSON.stringify(userp)
            });
        })
    } else {
        res.render('index', {
            user: JSON.stringify(req.user)
        });
    }
}


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
    var filter = req.params.parms;
    if (filter == 'all') {
        User.find(function(err, users) {
            if (err)
                res.send(500, err.message);
            res.status(200).jsonp(users);
        });
    } else {
        var params = JSON.parse(req.params.parms);
        var regex = new RegExp(params.filter, "i");
        var query = {$and: [{username: regex}, {username: {$ne: params.username}},{"_id": {$nin: params.users}}]};
        User
                .find(query)
                .limit(50)
                .exec(function(err, users) {
            if (err)
                res.json(err);
            
            res.status(200).jsonp(users);
        });
    }

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
    user.grups = [
        {
            open: true,
            users: [],
        }]

    // Then save the user 
    user.save(function(err) {
        if (err) {
            console.log(err)
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
/**
 * OAuth callback
 */
exports.getUser = function(id, next) {
    User.findOne({_id: id}, function(e, o) {
        if (o) {
            next(o)
        }
    })
};

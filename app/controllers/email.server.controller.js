'use strict';

/**
 * Module dependencies.
 */
var Email = {}, UserEmail = {};
var mongoose = require('mongoose'),
        Email = mongoose.model('emails');
UserEmail = mongoose.model('useremails');
var fs = require('fs');

var path = require('path');
/**
 * insertEmail
 */
exports.insertEmail = function(req, res) {
    req.body.FromName = req.user.email;
    var email = new Email(req.body);
    var values_insert = new Array();
    email.save(function(err, email) {
        if (err) {
            return res.send(500, err.message);
        } else {
            var bandeja = 's';
            if (req.body.state != 'env') {
                bandeja = 'b';
            }
            var eminsert = {
                state: 'no_leido',
                bandeja: bandeja,
                user: req.user.email,
                email: email._id
            }
            values_insert.push(eminsert);
            if (req.body.state == 'env') {
                for (var i = req.body.AddAddress.length - 1; i >= 0; i--) {
                    var eminsert = {
                        state: 'no_leido',
                        bandeja: 'e',
                        user: req.body.AddAddress[i],
                        email: email._id
                    }
                    values_insert.push(eminsert);
                }
            }
            UserEmail.create(values_insert, function(err, jellybean) {
                if (err) {
                    return res.send(500, err.message);
                } else {
                    res.status(200).jsonp(email);
                }
            });
        }
    });
}


/**
 * DeleteEmailUser
 */
exports.DeleteEmailUser = function(req, res) {
    var emails = req.params.parms;
    emails = JSON.parse(emails)
    var ides = new Array();
    if (emails.state == 'p') {
        DeleteMultipleEmail(emails.ids, req, res);
    } else {
        UpdateBandejaEmails(emails.ids, 'p', req, res);
    }
}

/**
 * UploadFiles
 */
exports.UploadFiles = function(req, res) {

    var oldPath = req.files.myFile.path;

    var separator = '/';
    var currentTime = new Date();
    var curTime = new Date();
    var curTime = curTime.getTime();
    var filename = curTime + '--' + req.files.myFile.name;
    var newPath = [__dirname, '../../public', 'uploads', filename].join(separator);

    console.log('>>>>>');
    console.log('oldPath', oldPath);
    console.log('newPath: ', newPath);
    console.log('filename: ', filename);
    var file = {
        modificationDate: req.files.myFile.modifiedDate || new Date(),
        name: req.files.myFile.name || "???",
        size: req.files.myFile.size || 0,
        type: req.files.myFile.type || "???",
        filename: filename
    };
    fs.rename(oldPath, newPath, function(err) {
        if (err === null) {
            var retObj = {
                meta: {"action": "upload", 'timestamp': new Date(), filename: filename},
                doc: file,
                err: err
            };
            return res.send(retObj);
        }
    });
}

/**
 * EmailsUser
 */
exports.EmailsUser = function(req, res) {
    UserEmail
            .find({user: req.user.email, bandeja: req.params.parms})
            .populate('email')
            .exec(function(err, emaillist) {
                if (err)
                    return handleError(err);
                res.status(200).send(emaillist);
            })
}

var UpdateBandejaEmails = function(ids, bandeja, req, res) {
    UserEmail
            .update(
                    {_id: {$in: ids}},
            {$set: {
                    bandeja: bandeja,
                }
            },
            {multi: true},
            function(err) {
                if (err) {
                    console.log('errorrr')
                    return res.send(500, err.message);
                }
                else
                    res.status(200).jsonp('ok');
            });
}
var DeleteMultipleEmail = function(ids, req, res) {
    UserEmail
            .remove({_id: {$in: ids}}, function(error) {
                if (error) {
                    return res.send(500, error.message);
                } else {
                    res.status(200).jsonp('ok');
                }
            });
}
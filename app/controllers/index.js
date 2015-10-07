var controllers;
// Requiring dependencies
var mongoose = require('mongoose');
// Configure Mongoose
var options = {
    db: {native_parser: true},
    server: {poolSize: 5},
//  replset: { rs_name: 'myReplicaSetName' },
//  user: 'admin',
//  pass: '123456'
}
uri = 'mongodb://127.0.0.1/meando';
var db = mongoose.connect(uri, options);
//var db = mongoose.connect('mongodb://localhost/emailangular');

require('../models')(mongoose);

controllers = {
    user: require('./users.server.controller'),
    email: require('./email.server.controller'),
    chat: require('./chat.server.controller'),
    ftp: require('./ftp.server.controller'),
};
module.exports = controllers;
/*
 http://mongoosejs.com/
 mongo
 show dbs
 use databaseName
 db.addUser('admin','123456')
 contrl-c
 sudo su
 gedit /etc/mongodb.conf
 descomentariar auth
 service mongodb restart
 mongo --port 27017 -u manager -p 123456 --authenticationDatabase admin
 */

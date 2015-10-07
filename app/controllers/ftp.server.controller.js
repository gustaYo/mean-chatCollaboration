
var mongoose = require('mongoose');
var Ftp = mongoose.model('ftps');
var FtpFiles = mongoose.model('ftpfiles');
var path = require('path');
var JSFtp = require("jsftp");
/**
 * AddFtp
 */
exports.AddFtpServer = function(req, res) {
    var data = req.body
    if (data._id) {
        var id = data._id;
        delete data['_id']
        Ftp.update(
                {_id: id},
        {$set: data
        }, function(err) {
            if (err)
                return res.send(500, err.message);
            else
                res.status(200).jsonp('ok');
        });
    } else {
        var ftp = new Ftp(data);
        ftp.save(function(err, newftp) {
            if (err) {
                return res.send(500, err.message);
            } else {
                res.status(200).jsonp(newftp);
            }
        });
    }
}
/**
 * GetFtps
 */
exports.GetFtps = function(req, res) {
    var param = JSON.parse(req.params.parms);
    if (param.type == 'ftps') {
        Ftp.find(function(err, ftps) {
            if (err)
                res.send(500, err.message);
            res.status(200).send(ftps);
        });
    } else {       
        var query = {name: new RegExp(param.name, "i"), extname: new RegExp(param.extname, "i"), "ftp": {$in: param.ftps}};
        FtpFiles.find(query)
                .limit(20)
                .exec(function(err, filesftps) {
            if (err)
                res.send(500, err.message);
            res.status(200).send(filesftps);
        });
    }
}

/**
 * GetFtps
 */
exports.GetFtpsFiles = function(req, res) {
    FtpFiles.find(function(err, filesftps) {
        if (err)
            res.send(500, err.message);
        res.status(200).send(filesftps);
    });
}

/**
 * DeleteFTP
 */
exports.DeleteFTP = function(req, res) {
    var id = req.params.parms;
    Ftp
            .remove({_id: id}, function(error) {
        if (error) {
            return res.send(500, error.message);
        } else {
            res.status(200).jsonp('ok');
        }
    });
}
/**
 * DeleteFTP
 */
exports.ScannerFTP = function(ftp, socket, next) {
    ScannerFTP(ftp, socket);
    next()
}

/**
 * ScannerFTP
 */
var ScannerFTP = function(ftp, socket) {
    Ftp.findOne({_id: ftp})
            .exec(function(err, result) {
        FtpFiles
                .remove({ftp: result._id}, function(error) {
            if (error) {
                console.log(error)
            } else {
                var ftp = new JSFtp({
                    host: result.uri,
//  port: 3331, // defaults to 21
                    user: result.user != '' ? result.user : '', // defaults to "anonymous"
                    pass: result.pass != '' ? result.pass : ''
//  pass: "1234" // defaults to "@anonymous"
                });
                var num = 0;
                var scannerServerRecur = function(dir) {
                    ftp.ls(dir, function(err, res) {
                        if (typeof res != 'undefined') {
                            var files_scanner = new Array();
                            res.forEach(function(file) {
                                if (file.type == 0) {
                                    var newFile = {
                                        name: file.name,
                                        extname: path.extname(file.name),
                                        directory: dir,
                                        ftp: result._id,
                                        size: file.size,
                                        time: file.time
                                    }
                                    files_scanner.push(newFile);
                                    num++;
                                }
                                if (file.type == 1) {
                                    var newPaht = dir + '/' + file.name
//                        console.log(newPaht)
                                    var log = {
                                        newPaht: newPaht,
                                        num: num,
                                    }
                                    socket.emit('logscanner', log);
                                    scannerServerRecur(newPaht)
                                }
                            });
                            //insertar multiple
                            FtpFiles.collection.insert(files_scanner, function(callback) {
//                        console.log('insertado')
                            })
                        }
                    });
                }
                scannerServerRecur(result.dirscan)
            }
        });
    })
}



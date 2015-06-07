/*
 var http = require('http').createServer(handler)
 , io = require('socket.io').listen(http).set('log level', 1);
 
 http.listen(3002);
 console.log('Chatserver soket.io listening on port ' + 3002);
 
 //io.configure(function() {
 //    io.set('transports', ['xhr-polling']);
 //    io.set('polling duration', 10);
 //});
 
 function handler(req, res) {
 res.writeHead(200);
 res.end();
 }
 */
module.exports = function(app, express, controllers, io) {

    var chat = express.Router();
    chat.route('/upload')
            .post(controllers.email.UploadFiles)
    app.use('/chat', chat);



    var nicknames = {};
    var log = {};
    var converAbiertas = {}
    var rooms = ['all'];
    io.sockets.on('connection', function(socket) {
        var address = socket.handshake.address;
        console.log("New connection from " + address.address + ":" + address.port);
        socket.on('nickname', function(nick, fn) {
            var i = 1;
            var orignick = nick;
//            while (nicknames[nick]) {
//                nick = orignick + i;
//                i++;
//            }
            fn(nick);
            socket.nickname = nick;
            var user = {
                nick: nick,
                socket: socket.id
            }
            nicknames[nick] = user;
            socket.join('all');
            addConver(nick, 'all');
            socket.broadcast.to('all').emit('announcement', nick + ' connected');
            io.sockets.emit('nicknames', nicknames);
        });
        socket.on('getlog', function() {
            io.sockets.socket(nicknames[socket.nickname].socket).emit('youlog', logByUser(socket.nickname, converAbiertas[socket.nickname]), nicknames);
        })
        socket.on('getlog conver', function(userTab) {
            var cn = new Array();
            cn.push(userTab)
            io.sockets.socket(nicknames[socket.nickname].socket).emit('log conver', logByUser(socket.nickname, cn));
        })
        socket.on('abrirConver', function(nick, conver) {
            addConver(nick, conver);
        });
        socket.on('cerrarConver', function(nick, conver) {
            closeConver(nick, conver)
        });
        socket.on('disconnect', function() {
            if (!socket.nickname)
                return;
            delete nicknames[socket.nickname];
            socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
            socket.broadcast.emit('nicknames', nicknames);
        });
        socket.on('sendMensaje', function(mensj) {
            mensj.send = socket.nickname;//seguridad
            updateLog(mensj);
            if (mensj.public) {
                io.sockets.in(mensj.recibe).emit("recibeMensaje", mensj);
            } else {
                if (typeof nicknames[mensj.recibe] != 'undefined') // no mensaje offline
                    io.sockets.socket(nicknames[mensj.recibe].socket).emit("recibeMensaje", mensj);
            }
        });
        function addConver(nick, conver) {
            if (converAbiertas[nick]) {
            } else {
                converAbiertas[nick] = new Array();
            }
            if (inArray(conver, converAbiertas[nick]) == -1) {
                converAbiertas[nick].push(conver);
            }
        }
        function closeConver(nick, conver) {
            converAbiertas[nick].splice(inArray(conver, converAbiertas[nick]), 1);
        }
    });

    function logByUser(user, array) {
        var logUser = {};
        for (var i in log) {
            //mensajes privados
            if ((log[i].send == user && !log[i].public) || (log[i].recibe == user)) {
                if ((inArray(log[i].send, array) != -1) || (inArray(log[i].recibe, array) != -1)) {
                    logUser[i] = log[i];
                }
            }
            // mensajes publicos
            if (log[i].public && (inArray(log[i].recibe, array) != -1)) {
                logUser[i] = log[i];
            }
        }
        return logUser;
    }

    function updateLog(mensj) {
        var curTime = new Date();
        log[curTime.getTime()] = mensj;
//        var i;
//        for (i in log) {
//            // Cull the log, removing entries older than a half hour.
//            if (i < (curTime.getTime() - 1800000)) {
//                delete log[i];
//            }
//        }
    }
    function inArray(needle, haystack) {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i] == needle)
                return i;
        }
        return -1;
    }


};

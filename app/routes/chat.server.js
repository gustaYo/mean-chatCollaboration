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
 	var converAbiertas = {};
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

controllers.chat.getRoomsUser(nick,function(salas){
	var length = salas.length;
	for (var i = 0; i < length; i++) {
		socket.join(salas[i]);
	}
	io.sockets.emit('nicknames', nicknames);
})

});
 		socket.on('getlog', function(fn) {
 			controllers.chat.getLog(socket.nickname,function(log){    
 				fn(log,nicknames)
			// io.sockets.socket(nicknames[socket.nickname].socket).emit('youlog',log, nicknames);
		})         
 		})
 		socket.on('getlog conver', function(userTab,fn) {
 			controllers.chat.getLogConver(socket.nickname,userTab,function(log){                
 				fn(log)
 			})
		   // io.sockets.socket(nicknames[socket.nickname].socket).emit('log conver', logByUser(socket.nickname, cn));
		})
 		socket.on('abrirConver', function(nick, conver,typeconver) { 			
 			addConver(nick, conver,typeconver);
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
 		socket.on('sendMensaje', function(mensj,configChat,fn) {
			mensj.send = socket.nickname;//seguridad
			var mensaje=''
			if(mensj.type=='text'){
				mensaje = FilterbadWords(strip_tags(linkify(mensj.mensaje), '<a><img>'));
			}else{
				mensaje=mensj.mensaje;
			}
			if (mensaje.length != 0 || mensj.type=='upload') {
				mensj.mensaje=mensajeStyle(mensaje,mensj.type,configChat);
				fn(mensj);
				updateLog(mensj);				
				if (mensj.public) {
					io.sockets.in(mensj.recibe).emit("recibeMensaje", mensj);					
				} else {
				if (typeof nicknames[mensj.recibe] != 'undefined'){ // no mensaje offline}
					io.sockets.socket(nicknames[mensj.recibe].socket).emit("recibeMensaje", mensj);
			}
			io.sockets.socket(nicknames[socket.nickname].socket).emit('recibeMensaje',mensj);
			addConver(socket.nickname, mensj.recibe,false);
			addConver(mensj.recibe, socket.nickname,false);			
		}

	}
});
 		socket.on('addSala', function(sala,fn) {
 			sala.create = socket.nickname;   
 			controllers.chat.addSala(sala,function(ss){
 				socket.join(ss._id);
 				fn(ss)
 				io.sockets.emit('roomupdate', ss);
 			})            
 		});
 		socket.on('getAllsalas', function(fn) {
 			controllers.chat.getAllSalas(fn)
 		});
 		socket.on('deleteSala', function(id,fn) {
 			controllers.chat.deleteSala(id,fn)
 		});
 		var FilterbadWords = function(mens) {
	//return dic[0].test(mens) ? '' : mens;
	return mens;
}
function mensajeStyle(mens, type,configChat) {
	var retorn = '';
	if (type == 'text') {
		var style = configChat.sytle;
		var cierra = '';
		for (var i in style) {
			if (style[i] == 'active') {
				retorn += '<' + i + '>';
				cierra += '</' + i + '>';
			}
		}
		retorn += mens += cierra;
	} else {
									// upload type
									retorn += formatUploat(mens);
								}
								return retorn;
							}
							function formatUploat(file) {
								var upload = '';
								if (file.doc.type.indexOf('image') > -1) {
									upload = '<img class = "thumbnail" src = "uploads/' + file.doc.filename + '" alt = "..." >';
								} else {
									upload = '<a href="uploads/' + file.doc.filename + '" class="btn btn-primary">' + file.doc.name + '</a>';
								}
								return upload;
							}
							function strip_tags(str, allow) {
																		// making sure the allow arg is a string containing only tags in lowercase (<a><b><c>)
																		allow = (((allow || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
																		var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
																		var commentsAndPhpTags = /[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
																		return str.replace(commentsAndPhpTags, '').replace(tags, function($0, $1) {
																			return allow.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
																		});
																	}
																	function linkify(inputText) {
																			//URLs starting with http://, https://, or ftp://
																			var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
																			var replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
		//URLs starting with www. (without // before it, or it'd re-link the ones done above)
		var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
		var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
		//Change email addresses to mailto:: links
		var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
		var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
		return replacedText
	}
	function addConver(nick, conver,type) {   
		if(type){
			nick= socket.nickname
			socket.join(conver)
		}        
		controllers.chat.addConversation(conver,nick,function(estate){
			console.log('conversacion abierta')
		})            
	}
	function closeConver(nick, conver) {
		controllers.chat.removeConversation(conver,nick,function(estate){
			console.log('conversacion cerrada')
		})
	}
});
function joinUserRooms(nick,socket){


}
function updateLog(mensj) {

	controllers.chat.addLog(mensj,function(log){
		   // console.log(log)
		})
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

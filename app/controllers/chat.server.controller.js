var Sala = {}, UserEmail = {};Log={};ConvAbierta={};
var mongoose = require('mongoose'),
Sala = mongoose.model('salas');
Log = mongoose.model('logs');
User = mongoose.model('User');

/**
 * AddSala
 */
 exports.addSala = function(data,next) {
 	if (typeof data._id != 'undefined'){
 		Sala
 		.update(
 			{_id: data._id},			
 			{
 				$set: {
 					name: data.name,
 					description: data.description
 				}
 			},
 			function(err) {
 				if (err) {
 					console.log(err)
 				}
 				else console.log('editadoo')
 					next({})
 			}
 			);
 	}else{
 		var sala = new Sala(data);
 		sala.save(function(err, sala) {
 			if (err) {
 				return next(err);
 			} else {
 				return next(sala);
 			}
 		});
 	}
 	
 }
/**
 * getAllSalas
 */
 exports.getAllSalas = function(next) {
 	Sala.find()
 	.sort({date: 1})
 	.exec(function(err, salas) {
 		if (err)
 			return next(err,null);
 		return next(null,salas);
 	})
 	
 };
 /**
 * deleteSala
 */
 exports.deleteSala = function(id,next) {
 	Sala
 	.remove({_id: id}, function(error) {
 		if (error) {
 			return next(err);
 		} else {
 			return next({});
 		}
 	});
 };
/**
 * addLog
 */
 exports.addLog = function(data,next) {
 	var log = new Log(data);
 	log.save(function(err, d) {
 		if (err) {
 			return next(err);
 		} else {
 			return next(d);
 		}
 	});
 };
 /**
 * addLog
 */
 exports.addConversation = function(conv,user,next) {
 	User.update(
 		{username: user},
 		{$addToSet: {convAbiertas: conv}}, function(err) {
 			if (err)
 				next(err);
 			else
 				next('ok');
 		});
 };
 /**
 * addLog
 */
 exports.removeConversation = function(conv,user,next) { 	
 	User.update(
 		{username: user},
 		{$pull: {convAbiertas: conv}}, function(err) {
 			if (err)
 				next(err);
 			else
 				next('ok');
 		});
 };

  /**
 * getLog
 */
 exports.getLog = function(user,next) {
 	var losgs_retorn=new Array();
 	var conversaciones_abiertas = new Array();
 	User.findOne({username: user}, function(e, o) { 		
 		if (o) {
 			conversaciones_abiertas = o.convAbiertas;
 		}
 		Log.find({$or: [{send: user,recibe: {$in: conversaciones_abiertas}}, {send: {$in: conversaciones_abiertas},recibe: user}],public:false})
 		.sort({create: -1})
 		.limit(50)
 		.exec(function(err, privados) { 			
 			if (err){
 				return next(err);
 			}else{
 				Log.find({recibe:{$in: conversaciones_abiertas},public:true})
 				.sort({create: -1})
 				.limit(50)
 				.exec(function(err, publicos) {
 					if (err){
 						return next(err);
 					}else{			
 						var cont=0;
 						for (var i = privados.length; i > 0; i--) {
 							losgs_retorn[cont]=privados[i-1]
 							cont++;
 						};
 						for (var i = publicos.length; i > 0; i--) {
 							losgs_retorn[cont]=publicos[i-1]
 							cont++;
 						};
 						return next(losgs_retorn);
 					}            	
 				})
 			}
 		})
 	});
 };
  /**
 * getLogConver
 */
 exports.getLogConver = function(send,recibe,next) {
 	if(recibe=='all'){
 		Log.find({recibe: recibe,public:true})
 		.sort({create: 1})
 		.exec(function(err, publicos) {
 			if (err){
 				return next(err);
 			}else{
 				return next(publicos)
 			}            	
 		})
 	}else{
 		Sala.findOne({_id: recibe}, function(e, o) {
 			if (o) {
 				Log.find({recibe: recibe,public:true})
 				.sort({create: 1})
 				.exec(function(err, publicos) {
 					if (err){
 						return next(err);
 					}else{
 						return next(publicos)
 					}            	
 				})		
 			}else{
 				Log.find({$or: [{send: send, recibe: recibe},{send: recibe, recibe: send}],public:false})
 				.sort({create: 1})
 				.exec(function(err, privados) {
 					if (err){
 						return next(err);
 					}else{
 						return next(privados)
 					}            	
 				})
 			}
 		})
 	}

 	

 	
 };

  /**
 * salasUser
 */
 exports.getRoomsUser = function(user,next) {
 	User.findOne({username: user}, function(e, o) {
 		var conversaciones_abiertas = new Array();
 		if (o) {
 			conversaciones_abiertas = o.convAbiertas;
 			next(conversaciones_abiertas)
 		}
 	})
 };
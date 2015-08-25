'use strict';
var pathArray = window.location.href.split('/');
var protocol = pathArray[0];
var host = pathArray[2];
var url = protocol + '//' + host;
var socket = io.connect(url);
// Authentication service for user variables
angular.module('myapp')
        .factory('Socket', function() {
            var _this = this;
            socket.on('connect', function() {
                console.log("user conectado")
            });
            var myNick = window.user != null ? window.user.username : '';
          
            _this.start=function(){
                 if (myNick != '') {
                socket.emit('nickname', myNick, function(nick) {
                    window.user.myNick = nick;
                });
            }       
            }
            _this.start();
            _this.socket = socket;
            return _this;
        })


'use strict';
var pathArray = window.location.href.split('/');
var protocol = pathArray[0];
var host = pathArray[2];
var url = protocol + '//' + host;
var socket = io.connect(url);
angular.module(AppName)
        .factory('Socket', function() {
            var _this = this;
            socket.on('connect', function() {
                console.log("user conectado")
            });         
            
            _this.socket = socket;
            return _this;
        })


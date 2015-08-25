angular.module('uiRouter.chat', ["ui.router", 'ngResource', 'ngCkeditor', 'ngTagsInput', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'angularFileUpload'])
.config(
    ['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {
        $stateProvider
        .state('chat', {
            url: '/chat',
            templateUrl: 'views/chat.html',
        })
        .state('chat.newsala',{
            url: '/n',
            templateUrl: 'views/chat_newSala.html',
            controller: 'salaCtrl',                                  
        })
        .state('chat.listsala',{
            url: '/r/{data}',
            templateUrl: 'views/chatList.html', 
            controller: 'salaCtrl',                                 
        })
    }
    ]
    );
var salas = new Array();

angular.module('uiRouter.chat').controller('chatController', function($location, $scope, $window, $http, Socket, localStorageService, $timeout, $upload, User,Authentication)
{
    $scope.scroll=($(window).height())-200;
    $scope.authentication = Authentication;
    if (window.user == null) {
        $location.path('/')
    }
    var configChat = localStorageService.get('configchat');
    if (configChat == null) {
        var configChat = {
            audio: 'glyphicon-volume-off',
            sytle: {
                b: false,
                italic: false
            }
        }
        localStorageService.add('configchat', configChat);
    }
    $scope.configChat = configChat;
    var miNick = $scope.authentication.user.username;
    var vm = this;
    var socket = Socket.socket;
    var usuarios = new Array();
    vm.users = new Array()
    var users = new Array();
    $scope.salas= new Array();
    $scope.user=$scope.authentication.user;

    var getSalas= function(){
      Socket.socket.emit('getAllsalas',function(err,retorn){
        $timeout(function() {
            salas=retorn;  
        }); 
    });
  }
  getSalas();
  socket.on('roomupdate',function(sala){
   salas.push(sala)
});
  $scope.tabs = [{_id: 'all', name: 'General', content: new Array(), public: true}];
  socket.on('nicknames', function(nicknames) {
    update_users(nicknames);
});
  socket.emit('getlog', function(log, nicknames) {
    User.listUsers(function(users) {
        vm.users = [];
        for (var i in users) {
            if (typeof users[i].username != 'undefined' && users[i].username != miNick)
                vm.users.push({_id: users[i].username, name: users[i].username, inline: false});
        }
        $timeout(function() {
           update_users(nicknames);
           for (var i in log) {
            recibeMensaje(log[i], vm.users);
        }
        if (configChat.audio == 'glyphicon-volume-up')
            $('#audio_login')[0].play();
    });;
    })
});


  var update_users = function(nicknames) {
    if (vm.users.length > 0) {
        $scope.$apply(function() {
            for (var i in vm.users) {
                vm.users[i].inline = false;
            }
            for (var i in nicknames) {
                var pos = foundUser(nicknames[i].nick, vm.users);
                if (pos != -1) {
                    vm.users[pos].inline = true
                }
            }
        });
    }
}
socket.on('recibeMensaje', function(msj) {
    recibeMensaje(msj, vm.users);
    if (configChat.audio == 'glyphicon-volume-up')
        $('#audio_receive')[0].play();
});
var recibeMensaje = function(msj, users) {
    $scope.$apply(function() {
        var tabActive = foundTabActive($scope.tabs);
        if (!msj.public) {
                    // obtener datos de usuario para tab conversacion
                    var send = msj.send == miNick ? msj.recibe : msj.send;

                    var pos_user = foundUser(send, users);
                    // abrir converzacion pero en tab no activo
                    var post = $scope.tabActiveUser(users[pos_user], $scope.tabs[tabActive].name == send);
                    mensajeShow(post, msj, msj.send == miNick ? 'right' : 'left');
                } else {
                    // la unica sala activa por el momento es all todos los usuarios pertenecen por defecto a esta sala
                    if(msj.recibe!='all'){
                        num=foundTab(msj.recibe,salas)
                        $scope.tabActiveUser(salas[num], $scope.tabs[tabActive]._id == msj.recibe,true);
                    }
                    mensajeShow(foundTab(msj.recibe, $scope.tabs), msj, msj.send == miNick ? 'right' : 'left');
                }
            });
}
$scope.tabActiveUser = function(usuario, estado, gg) {
    if(gg==null){
        gg=false;
    }
    var postActive = foundTab(usuario._id, $scope.tabs)
    if (postActive) {
        $scope.tabs[postActive].active = estado;
        return postActive;
    } else {
        usuario.content = new Array();
        usuario.active = estado;
        if (estado) {
            socket.emit('abrirConver', miNick, usuario._id,gg);
        }
        usuario.public = gg;
        $scope.tabs.push(usuario);
        return $scope.tabs.length - 1;
    }
}
$scope.closeConversation = function(idTab) {
    var position = foundTab(idTab, $scope.tabs);
    $scope.tabs.splice(position, 1);
    socket.emit('cerrarConver', miNick, idTab);
}

var mensajeShow = function(tabActive, mesaje, dir) {
    mesaje.dir=dir
    $scope.tabs[tabActive].content.push(mesaje);
}
$scope.sendMensaje = function(type) {
    var mensaje = $scope.mensajeChat;
      var tabActive = foundTabActive($scope.tabs);
    var mens = {
        send: miNick,
        recibe: $scope.tabs[tabActive]._id,
        mensaje: mensaje,
        public: $scope.tabs[tabActive].public,
        date: tstamp(),
        type: type
    }
        socket.emit('sendMensaje', mens,$scope.configChat,function(mens){
           if (mens.mensaje.length == 0) {
            return false;
        }  
        if (type == 'text') {
            $("#content_" + $scope.tabs[tabActive]._id).animate({
                "scrollTop": $("#content_" + $scope.tabs[tabActive]._id)[0].scrollHeight
            }, "slow");
          
        }
           $scope.mensajeChat = '';
        return true
    })
   
}

var foundUser = function(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i].name === needle)
            return i;
    }
    return -1;
}

function foundTabActive(haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i].active == true)
            return i;
    }
    return false;
}


function tstamp(stamp) {
                                                //http://www.w3schools.com/jsref/jsref_obj_date.asp
                                                //  var time_str = time.toString('MMM dd, yyyy hh:mm');
                                                var currentTime = new Date();
                                                if (typeof stamp != 'undefined') {
                                                    currentTime.setTime(stamp);
                                                }
                                                var days = new Array('Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat');
                                                var day = currentTime.getDay();
                                                var hours = currentTime.getHours();
                                                var minutes = currentTime.getMinutes();
                                                var mes = currentTime.getMonth();
                                                var dia = currentTime.getDate();
                                                if (minutes < 10) {
                                                    minutes = "0" + minutes;
                                                }
                                                if (hours > 11) {
                                                    var ap = 'p';
                                                }
                                                else {
                                                    var ap = 'a';
                                                }
                                                if (hours > 12) {
                                                    hours = hours - 12;
                                                }
                                                return "[" + days[day] + " " + hours + ":" + minutes + ap + "m] " + dia + "-" + (mes + 1);
                                            }
                                            $scope.audioSet = function() {
                                                configChat.audio = configChat.audio == 'glyphicon-volume-off' ? 'glyphicon-volume-up' : 'glyphicon-volume-off';
                                                localStorageService.add('configchat', configChat);
                                            }
                                            $scope.activeStyle = function(style) {
                                                configChat.sytle[style] = configChat.sytle[style] == 'active' ? '' : 'active';
                                                localStorageService.add('configchat', configChat);
                                            }
                                            $scope.seeConverCompleta = function() {
                                                var tabActive = foundTabActive($scope.tabs);
                                                $scope.tabs[tabActive].content = new Array();
                                                socket.emit('getlog conver', $scope.tabs[tabActive]._id,function(logConver){
                                                  $timeout(function() {
                                                    for (var i in logConver) {
                                                        recibeMensaje(logConver[i], vm.users);
                                                    }
                                                }); });
                                            }

                                            /*                       UPLOAD                        */

                                            $scope.uploadRightAway = true;
                                            $scope.hasUploader = function(index) {
                                                return $scope.upload[index] != null;
                                            };
                                            $scope.abort = function(index) {
                                                $scope.upload[index].abort();
                                                $scope.upload[index] = null;
                                            };
                                            $scope.onFileSelect = function($files) {
                                                $scope.selectedFiles = [];
                                                $scope.progress = [];
                                                if ($scope.upload && $scope.upload.length > 0) {
                                                    for (var i = 0; i < $scope.upload.length; i++) {
                                                        if ($scope.upload[i] != null) {
                                                            $scope.upload[i].abort();
                                                        }
                                                    }
                                                }
                                                $scope.upload = [];
                                                $scope.uploadResult = [];
                                                $scope.selectedFiles = $files;
                                                $scope.dataUrls = [];
                                                for (var i = 0; i < $files.length; i++) {
                                                    var $file = $files[i];
                                                    if (window.FileReader && $file.type.indexOf('image') > -1) {
                                                        var fileReader = new FileReader();
                                                        fileReader.readAsDataURL($files[i]);
                                                        function setPreview(fileReader, index) {
                                                            fileReader.onload = function(e) {
                                                                $timeout(function() {
                                                                    $scope.dataUrls[index] = e.target.result;
                                                                });
                                                            }
                                                        }
                                                        setPreview(fileReader, i);
                                                    }
                                                    $scope.progress[i] = -1;
                                                    if ($scope.uploadRightAway) {
                                                        $scope.start(i);
                                                    }
                                                }
                                            }
                                            $scope.start = function(index) {
                                                $scope.progress[index] = 0;
                                                $scope.upload[index] = $upload.upload({
                                                    url: 'chat/upload',
                                                    headers: {'myHeaderKey': 'myHeaderVal'},
                                                    data: {
                                                        title: $scope.title,
                                                        author: $scope.author,
                                                        description: $scope.description
                                                    },
                                                    file: $scope.selectedFiles[index],
                                                    fileFormDataName: 'myFile'
                                                }).then(function(response) {
                                                    $scope.item = response.data;
                                                    $scope.mensajeChat = response.data;
                                                    $scope.sendMensaje('upload');
                                                    setTimeout(function() {
                                                        $('#fileUpload' + index).fadeOut()
                                                    }, 600);

                                                }, null, function(evt) {
                                                    $scope.progress[index] = parseInt(100.0 * evt.loaded / evt.total);
                                                });
                                            }
                                            $scope.openVideoAudio=function(){
                                                $('#chatVideoAudio').modal('show')
                                            }

                                        });

angular.module('uiRouter.chat')
.controller('salaCtrl', salaCtrl);
var sala_temp={}

function salaCtrl($scope, $location, $stateParams,Socket,$location,$timeout,Authentication) {
    $scope.sala={};
    if (!isEmptyJSON(sala_temp)){
        $scope.sala=sala_temp;
    }
    $scope.misSalas=function(){
        Socket.socket.emit('getAllsalas',function(err,retorn){
            $timeout(function() {
             $scope.$apply(function() {
                $scope.salas=retorn;
                sala_temp={}
            });    
         }); 
        });
    }   
    $scope.editSala=function(sala){
        sala_temp = sala;
        $location.url("/chat/n");
    }
    $scope.authentication = Authentication;
    $scope.misSalas();
    $scope.addSala=function(){
        Socket.socket.emit('addSala',$scope.sala,function(sala){
            $timeout(function() {
                sala_temp={}
                $location.url("/chat/r/my");
            });
        });
    }
    $scope.cancel=function(){
       $location.url("/chat/r/my");
   }
   $scope.deleteSala=function(sala){
    if(confirm('Desea eliminar realmente'))
      Socket.socket.emit('deleteSala',sala._id,function(retorn){
        $timeout(function() {
            if (typeof retorn.message != 'undefined'){
                alert('error')
            }else{
               var position = foundTab(sala._id, $scope.salas);
               $scope.salas.splice(position, 1);
           }              
       });
    });
}
}
function foundTab(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i]._id == needle)
            return i;
    }
    return false;
}

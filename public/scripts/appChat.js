angular.module('uiRouter.chat', ["ui.router", 'ngResource', 'ngCkeditor', 'ngTagsInput', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'angularFileUpload'])
        .config(
                ['$stateProvider', '$urlRouterProvider',
                    function($stateProvider, $urlRouterProvider) {
                        $stateProvider
                                .state('chat', {
                                    url: '/chat',
                                    templateUrl: 'views/chat.html',
                                })
                    }
                ]
                );
angular.module('uiRouter.chat').controller('chatController', function($location, $scope, $window, $http, Socket, localStorageService, $timeout, $upload, User)
{
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
    var miNick = window.user.username;
    var vm = this;
    var socket = Socket.socket;
    var usuarios = new Array();
    vm.users = new Array()
    var users = new Array();
    $scope.tabs = [{id: 'all', name: 'General', content: '', public: true}];
    socket.on('nicknames', function(nicknames) {
        update_users(nicknames);
    });
    socket.emit('getlog');
//    socket.emit('getnicknames', 'user');
//    socket.emit('getlog', miNick);
    socket.on('youlog', function(log, nicknames) {
        User.listUsers(function(users) {
            vm.users = [];
            for (var i in users) {
                if (typeof users[i].username != 'undefined' && users[i].username != miNick)
                    vm.users.push({id: users[i].username, name: users[i].username, inline: false});
            }
            setTimeout(function() {
                update_users(nicknames);
                for (var i in log) {
                    recibeMensaje(log[i], vm.users);
                }
                if (configChat.audio == 'glyphicon-volume-up')
                    $('#audio_login')[0].play();
            }, 1000);
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
                var send = msj.send == miNick ? msj.recibe : msj.send
                var pos_user = foundUser(send, users);
                // abrir converzacion pero en tab no activo
                var post = $scope.tabActiveUser(users[pos_user], $scope.tabs[tabActive].name == send);
                mensajeShow(post, msj, msj.send == miNick ? 'right' : 'left');
            } else {
                // la unica sala activa por el momento es all todos los usuarios pertenecen por defecto a esta sala
                mensajeShow(foundTab(msj.recibe, $scope.tabs), msj, msj.send == miNick ? 'right' : 'left');
            }
        });
    }
    $scope.tabActiveUser = function(usuario, estado) {
        var postActive = foundTab(usuario.id, $scope.tabs)
        if (postActive) {
            $scope.tabs[postActive].active = estado;
            return postActive;
        } else {
            usuario.content = 'Conversacion con ' + usuario.name;
            usuario.active = estado;
            if (estado) {
                socket.emit('abrirConver', miNick, usuario.id);
            }
            usuario.public = false;
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
        $scope.tabs[tabActive].content += formatoMEnsaje(mesaje, dir);
    }
    $scope.sendMensaje = function(type) {
        var mensaje = $scope.mensajeChat;
        if (type == 'text') {
            var mensaje = FilterbadWords(strip_tags(linkify(mensaje), '<a><img>'));
            if (mensaje.length == 0) {
                //          $('#audio_error')[0].play();
                return;
            }
        }
        var tabActive = foundTabActive($scope.tabs);
        var mens = {
            send: miNick,
            recibe: $scope.tabs[tabActive].id,
            mensaje: mensajeStyle(mensaje, type),
            original: mensaje,
            public: $scope.tabs[tabActive].public,
            date: tstamp(),
            type: type
        }

        if (!mens.public) {
            mensajeShow(tabActive, mens, 'right');
            socket.emit('abrirConver', miNick, mens.recibe);
            socket.emit('abrirConver', mens.recibe, miNick);
        } else {
            socket.emit('abrirConver', miNick, mens.recibe);
        }
        if (type == 'text') {
            $("#content_" + $scope.tabs[tabActive].id).animate({
                "scrollTop": $("#content_" + $scope.tabs[tabActive].id)[0].scrollHeight
            }, "slow");
        }
        socket.emit('sendMensaje', mens);
        $scope.mensajeChat = '';
    }
    function foundTab(needle, haystack) {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i].id == needle)
                return i;
        }
        return false;
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
    var dic = [
        /sex[a-z]+|caraj[o]|buga[r]+[oó]([a-z]+)*|mari[cq](a|[oóu])([ni][a-z]+)*|mojon([a-z]+)*|put(a|[aoóií])([ntz][a-z]+)*|jod(a|[oóei])([a-z]+)*|choch(a|[oóií])([ntz][a-z]+)*|cri[cq](a|[uoóeé])([a-z]+)*|tet(a|[oói])([ntcz][a-z]+)*|jam(a|[oóeé])([a-z]+)*|copul(a|[oóeé])([a-z]+)*|forni[cq](a|[uoóeé])([a-z]+)*|foll(a|[oóeé])([a-z]+)*|kimb(a|[oóeé])([a-z]+)*|sing(a|[áuoóeé])([a-z]+)*|pene|ping(a|[oei])([rs][oa][a-z]+)*|coj[oó]n(e|u[a-z]+)*|mierd[aeiuo]([a-z]+)*|ping(a|[oei])([rs][oa][a-z]+)*|morrong(a|[oóei])([rs][oa][a-z]+)*|fan(a|[oei])([^t]([rs][oa][a-z]+)*)*|cul(o|[iaeó])([a-z]+)*|nalg(a|[oóiu])([a-z]+)*|^(les[bv]ian)|^(tortille)^(est[úu]pid)|^idiot|^anormal|mong[óo]lico|^(imb[eé]sil)|^(<script)|^(<style)/g,
    ];
    var FilterbadWords = function(mens) {
        return dic[0].test(mens) ? '' : mens;
    }

    function formatoMEnsaje(men, orientation) {
        var mensaje = '';
        retorn = '';
        var mensaje = '<div class="col-md-9">' +
                '<div class="popover ' + orientation + ' popover_chat">' +
                '<div class="arrow"></div>' +
                '<div class="popover-content">' +
                '<p>' + men.mensaje + '</p>' +
                ' </div>' +
                '</div>' +
                ' </div>';
        var user = miNick;
        if (orientation == 'left') {
            user = men.send;
        }
        var usuario = '<div class="col-md-3">' +
                '<h4>' + user + '</h4>' +
                '<p>' + men.date + '</p>' +
                ' </div>';
        var retorn = '<div class="col-md-12 row">';
        if (orientation == 'left') {
            retorn += mensaje;
            retorn += usuario;
        } else {
            retorn += usuario;
            retorn += mensaje;
        }
        retorn += '</div>';
        return retorn;
    }
    function mensajeStyle(mens, type) {
        var retorn = '';
        if (type == 'text') {
            var style = $scope.configChat.sytle;
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
        $scope.tabs[tabActive].content = '';
        socket.emit('getlog conver', $scope.tabs[tabActive].id);
    }
    socket.on('log conver', function(logConver) {
        for (var i in logConver) {
            recibeMensaje(logConver[i], vm.users);
        }
    });

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
});

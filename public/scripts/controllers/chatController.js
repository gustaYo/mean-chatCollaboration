
var salas = new Array();
/*                       VENTANA MODAL DE USUARIOS                        */

angular.module('Module.chat').controller('ModalInstanceCtrl', function(User, $scope, $controller, $modalInstance, items, Socket, Authentication, sharedValues) {

    $controller('chatController', {$scope: $scope}); //accediendo a variables de controlador padre
    $scope.items = items;
    $scope.userSelected = [];
    $scope.curPage = 0;
    $scope.pageSize = 8;
    $scope.user = Authentication.getUser();
    $scope.users = sharedValues.getValue('users')
    $scope.numberOfPages = function() {
        return Math.ceil($scope.items.length / $scope.pageSize);
    };
    $scope.foundFilterUser = function(filter) {
        $scope.items = [];
        $scope.curPage = 0;
        $scope.foundUserFilter(filter);
    }
    $scope.selectedUser = function(user, $event) {
        if ($scope.userSelected[user.username]) {
            delete $scope.userSelected[user.username];
        } else {
            $scope.userSelected[user.username] = user;
        }

    }
    $scope.addUserGroup = function(group) {
        var position = $scope.user.grups.indexOf(group);
        var idsUsers = new Array();
        for (var i in $scope.userSelected) {
            $scope.user.grups[position].users.push($scope.userSelected[i]);
            idsUsers.push($scope.userSelected[i]._id);
            // actualizando listad de acces rapido de usuarios
            $scope.users[$scope.userSelected[i].username] = $scope.userSelected[i];
            //  Eliminar de la lista de seleccion 
            var g = $scope.items.indexOf($scope.userSelected[i]);
            $scope.items.splice(g, 1);
        }
        $scope.userSelected = [];
        Socket.socket.emit('addUserGroup', {user: $scope.user._id, group: group.name, usersadd: idsUsers, peti: true}, function(err, nicknames) {
            if (err) {
                alert('explote')
            } else {

            }
        });
    }
    $scope.cancelPeti = function(user) {
        Socket.socket.emit('cancelPeti', {user: $scope.user.username, userdelete: user._id}, function(err, retorn) {
            if (err) {
                alert('explote')
            } else {
                // bien
                $scope.$apply(function() {
                    var position = $scope.user.peti.indexOf(user._id);
                    $scope.user.peti.splice(position, 1);
                })
            }
        });

    }
    $scope.addUserGroupPeti = function(group, user) {
        var position = $scope.user.grups.indexOf(group);
        $scope.user.grups[position].users.push(user);
        $scope.users[user.username] = user;
        $scope.cancelPeti(user)
        Socket.socket.emit('addUserGroup', {user: $scope.user._id, group: group.name, usersadd: [user._id], peti: false}, function(err, nicknames) {
            if (err) {
                alert('explote')
            } else {

            }
        });
        //eliminar peticion de la lista
    }

    $scope.ok = function() {
        $modalInstance.close($scope.selected.item);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    // pagination
    /*                       FILTRO VENTANA MODAL DE BUSQUEDA DE USUARIOS                     */

    $scope.foundUserFilter = function(filter) {
        // obtener ids de usuarios de grupos y peticiones para excluir en la consulta
        var usersUser = new Array();
        for (var i in $scope.user.grups) {
            for (var user in $scope.user.grups[i].users) {
                usersUser.push($scope.user.grups[i].users[user]._id)
            }
        }
        // adicionando las peticiones tambien al grupo
        for (var i in $scope.user.peti) {
            usersUser.push($scope.user.peti[i]._id)
        }
        // contruir objeto a mandar consulta al servidor
        var jsonData = JSON.stringify({
            username: $scope.user.username,
            users: usersUser,
            filter: filter
        });

        User.listUsers(jsonData, function(users) {
            for (var i in users) {
                if (typeof users[i].username != 'undefined') {
                    $scope.items.push(users[i]);
                }
            }
        })
    }


});
var salas = new Array()
angular.module('Module.chat').controller('chatController', function($location, $scope, $window, $http, Socket, localStorageService, $timeout, $upload, User, Authentication, $modal, $log, sharedValues)
{ 
    $scope.user = Authentication.getUser();
    $scope.users = [];
    $scope.online = []
    var miNick = $scope.user.username;
    var vm = this;
    var socket = Socket.socket;
    $scope.salas = new Array();
    $scope.items = [];
    $scope.animationsEnabled = true;
    $scope.scroll = ($(window).height()) - 200;
    if ($scope.user == null) {
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
    $scope.initCHAT = function() {
        socket.emit('nickname', $scope.user, function(nick) {
            console.log(nick)
        });
        socket.emit('getlog', function(log, nicknames) {
            $timeout(function() {
                for (var i in log) {
                    recibeMensaje(log[i], vm.users);
                }
                if (configChat.audio == 'glyphicon-volume-up')
                    $('#audio_login')[0].play();
            });
        });
    }





    /*                       GRUPO DE USUARIOS                        */
    $scope.addUserGroup = function(size) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/modals/AddUserGroup.html',
            controller: 'ModalInstanceCtrl',
            size: size,
            resolve: {
                items: function() {
                    $scope.items = [];
                    // $scope.foundUserFilter("");
                    return $scope.items;
                }
            }
        });
        modalInstance.result.then(function(selectedItem) {
            $scope.selected = selectedItem;
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    function isAtBottom() {
        var scrollTop = element.scrollTop();
        var maxHeight = element.prop("scrollHeight") - element.prop("clientHeight");

        return scrollTop >= maxHeight;
    }
    $scope.addGroup = function() {
        bootbox.prompt({
            title: "Nombre grupo",
            placeholder: "nombre grupo",
            callback: function(result) {
                if (result !== null) {
                    var gr = {name: result,
                        open: true,
                        users: []
                    }
                    socket.emit('addGrupo', {user: miNick, group: gr}, function(err, retorn) {
                        if (err) {
                            alert('explote')
                        } else {
                            $scope.$apply(function() {
                                $scope.user.grups.push(gr)
                            })
                        }
                    });
                }
            }
        });
    }
    socket.on('peticionAmistad', function(user) {
        alert('peticion de amistad')
        $scope.$apply(function() {
            $scope.user.peti.push(user)
        })
//        $scope.addUserGroup()
    });

    $scope.toggleAnimation = function() {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

    $scope.toogleOpenGroup = function(group) {
        var position = $scope.user.grups.indexOf(group);
        $scope.user.grups[position].open = $scope.user.grups[position].open ? false : true;
    }

    $scope.sortableOptions = {
        connectWith: '.grupos_user',
        placeholder: "ui-state-highlight",
        update: function() {
            // obtener ultima actualizacion
            var gruponame = this.id.split('group__')[1]

            var new_list_user = new Array();
            $('.liuser', this).each(function(index, elem) {
                var $listItem = $(elem),
                        newIndex = $listItem.index();
                console.log($(elem).attr('id').split('-')[1])
                new_list_user.push($(elem).attr('id').split('-')[1])
                // Persist the new indices.
            });

            var usersgrupo = UsersGrupo(gruponame)
            console.log(usersgrupo)
            /*
             Socket.socket.emit('ordenaGrupo', {user: $scope.user._id, name: gruponame, neworder: new_list_user}, function(err, retorn) {
             if (err) {
             alert('error')
             }
             });
             */
        }
    };
    var UsersGrupo = function(name) {
        var users = new Array();
        for (var grupo in $scope.user.grups) {
            if ($scope.user.grups[grupo].name == name)
                for (var user in $scope.user.grups[grupo].users) {
                    users[user] = $scope.user.grups[grupo].users[user]._id
                }
        }
        return users;
    }

    /*                       CHAT CONVERSATION                        */

    $scope.tabs = [{_id: 'all', tab: 'all', name: 'General', content: new Array(), public: true}];
    socket.on('nicknames', function(nicknames) {
        $scope.updateUserConnect(nicknames);
    });

    $scope.updateUserConnect = function(nicknames) {
        $scope.$apply(function() {
            var usersUser = []
            for (var grupo in $scope.user.grups) {
                for (var user in $scope.user.grups[grupo].users) {
                    usersUser[$scope.user.grups[grupo].users[user].username] = $scope.user.grups[grupo].users[user];
                }
            }
            $scope.users = sharedValues.updateValue('users', usersUser)
            $scope.online = sharedValues.updateValue('online', nicknames)
        })
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
                var user = $scope.users[send];

                if (typeof user != 'undefined') {
                    // abrir converzacion pero en tab no activo
                    var post = $scope.tabActiveUser(user, $scope.tabs[tabActive].name == send);
                    mensajeShow(post, msj, msj.send == miNick ? 'right' : 'left');
                }
            } else {
                // mejorar trabajo con salas
                if (msj.recibe != 'all') {
                    var num = foundId(msj.recibe, salas)
                    $scope.tabActiveUser(salas[num], $scope.tabs[tabActive].tab == msj.recibe, true);
                }
                mensajeShow(foundTab(msj.recibe, $scope.tabs), msj, msj.send == miNick ? 'right' : 'left');
            }
        });
    }
    $scope.tabActiveUser = function(usuario, estado, gg) {
        if (gg == null) {
            gg = false;
        }
        // arreglar despues esto
        if (typeof usuario.username != 'undefined') {
            usuario.tab = usuario.username;
            usuario.name = usuario.username;
        } else {
            usuario.tab = usuario._id;
        }
        var postActive = foundTab(usuario.tab, $scope.tabs)
        if (postActive) {
            $scope.tabs[postActive].active = estado;
            return postActive;
        } else {
            usuario.content = new Array();
            usuario.active = estado;
            if (estado) {
                socket.emit('abrirConver', miNick, usuario.tab, gg);
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
        mesaje.dir = dir
        $scope.tabs[tabActive].content.push(mesaje);
    }
    $scope.sendMensaje = function(type) {
        var mensaje = $scope.mensajeChat;
        var tabActive = foundTabActive($scope.tabs);
        var mens = {
            send: miNick,
            recibe: $scope.tabs[tabActive].tab,
            mensaje: mensaje,
            public: $scope.tabs[tabActive].public,
            date: tstamp(),
            type: type
        }
        socket.emit('sendMensaje', mens, $scope.configChat, function(mens) {
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

    $scope.foundUser = function(needle, haystack) {
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
        socket.emit('getlog conver', $scope.tabs[tabActive].tab, function(logConver) {
            $timeout(function() {
                for (var i in logConver) {
                    recibeMensaje(logConver[i], vm.users);
                }
            });
        });
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
    $scope.openVideoAudio = function() {
        $('#chatVideoAudio').modal('show')
    }
    /*                       SALAS                        */
    var getSalas = function() {
        Socket.socket.emit('getAllsalas', function(err, retorn) {
            $timeout(function() {
                salas = retorn;
            });
        });
    }
    getSalas();
    socket.on('roomupdate', function(sala) {
        salas.push(sala)
    });

});

angular.module('Module.chat')
        .controller('salaCtrl', salaCtrl);
var sala_temp = {}

function salaCtrl($scope, $location, $stateParams, Socket, $location, $timeout, Authentication) {
    $scope.sala = {};
    if (!isEmptyJSON(sala_temp)) {
        $scope.sala = sala_temp;
    }
    $scope.misSalas = function() {
        Socket.socket.emit('getAllsalas', function(err, retorn) {
            $timeout(function() {
                $scope.$apply(function() {
                    $scope.salas = retorn;
                    sala_temp = {}
                });
            });
        });
    }
    $scope.editSala = function(sala) {
        sala_temp = sala;
        $location.url("/chat/n");
    }
    $scope.authentication = Authentication;
    $scope.misSalas();
    $scope.addSala = function() {
        Socket.socket.emit('addSala', $scope.sala, function(sala) {
            $timeout(function() {
                sala_temp = {}
                $location.url("/chat/r/my");
            });
        });
    }
    $scope.cancel = function() {
        $location.url("/chat/r/my");
    }
    $scope.deleteSala = function(sala) {
        if (confirm('Desea eliminar realmente'))
            Socket.socket.emit('deleteSala', sala._id, function(retorn) {
                $timeout(function() {
                    if (typeof retorn.message != 'undefined') {
                        alert('error')
                    } else {
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
        if (haystack[i].tab == needle)
            return i;
    }
    return false;
}
function foundId(needle, haystack) {
    var length = haystack.length;
    for (var i = 0; i < length; i++) {
        if (haystack[i]._id == needle)
            return i;
    }
    return false;
}


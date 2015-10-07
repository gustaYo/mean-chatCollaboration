'use strict';

/**
 * @ngdoc function
 * @name email_angular.controller:EmailCtrl
 * @description
 * # EmailCtrl
 * Controller of the myApp
 */
angular.module('Module.email').controller('appController', appController);
function appController($scope, $location) {
   
}
var email_temp = {}
angular.module('Module.email').controller('redactaController', redactaController);

function redactaController($scope, $location, $http, $stateParams, Email) {
    var myNick = 'yo'
    $scope.carp_name = 'r';
    console.log($stateParams.data)
    if (!isEmptyJSON(email_temp))
        if ($stateParams.data == 'reen') {
            $scope.email = email_temp;
            $scope.carp_name = 'ree';
            $scope.email.body = '<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p><p style="text-align: center;"><strong>--Mensaje Original</strong>--</p>Enviado: ' + email_temp.email.date + email_temp.email.Body;
            $scope.email.subject = 'Re: ' + email_temp.email.Subject
        }
    events_redacta($http, $scope, myNick, $location, Email);
}
function isEmptyJSON(obj) {
    for (var i in obj) {
        return false;
    }
    return true;
}

function events_redacta($http, $scope, myNick, $location, Email) {
    //añadimos usuarios por defecto
    $scope.cancela = function() {
        $location.url("/email/e");
    }
    var state = 'env'
    $scope.borrador = function() {
        state = 'borr'
        $scope.enviar_email();
        $location.url("/email/e");
    }
    $scope.enviar_email = function() {
        var emails = new Array();
        for (var i = 0; i < $scope.emails.length; i++) {
            emails.push($scope.emails[i].text)
        }
        var send_email = {
            "IsHTML": true,
            "AddAddress": emails,
            "Subject": $scope.email.subject,
            "Body": $scope.email.body,
            "FromName": myNick,
            "state": state
        }
        Email.insertEmail(send_email, function(resul) {
            $location.url("/email/e");
        });
    }
    $scope.editorOptions = {
        language: 'es',
//                 uiColor: '#000000'
    };
    $scope.$on("ckeditor.ready", function(event) {
        $scope.isReady = true;
    });
//    $scope.save = function() {
//        $http.post('/examples/test.php', {
//            content: $scope.test
//        }).success(function() {
//            alert('Saved');
//        });
//    }
//    $scope.save = function() {
//        console.info($scope.test, 'save');
//    }
    $scope.emails = [
        {text: window.user.email}
    ];
    $scope.loadTags = function(query) {
        return $http.get('auth/filter_user/' + query);
//        return[
//            {text: 'just'},
//            {text: 'some'},
//            {text: 'cool'},
//            {text: 'tags'}
//        ]
    };
}
angular.module('Module.email')
        .controller('RowClickEventCtrl', RowClickEventCtrl);


function RowClickEventCtrl($scope, $location, $stateParams, Email) {
    $scope.carp_name = $stateParams.data;
    var vm = this;
    vm.emails = [];
    Email.list_emails($('#data-user-email').attr('email'), function(emails) {
        vm.emails = emails;
    });
    $scope.showEmail = function(email) {
        $scope.email = email;
        if (email.state != 'leido') {
            email.state = 'leido';
            // consulta a servidor para cambiar state de email
            Email.updateEmail(email, function(result) {
//                alert(result)
            })
        }
    }
    vm.seleccionados = [];
    var state = false;
    vm.toogleAll = function() {
        if (state) {
            vm.seleccionados = [];
            state = false;
        } else {
            for (var i in vm.emails) {
                if (typeof vm.emails[i]._id != 'undefined')
                    vm.seleccionados[vm.emails[i]._id] = true;
            }
            state = true;
        }
    }
    vm.selectMy = function(email) {
        if (!vm.seleccionados[email._id]) {
            delete vm.seleccionados[email._id];
        } else {
            vm.seleccionados[email._id] = true;
        }
    }
    vm.deleteSelect = function() {
        var state_action = {}
        var list_ids_update = new Array();
        for (var i in vm.seleccionados) {
            list_ids_update.push(i);
        }
        if (list_ids_update.length > 0) {
            state_action.ids = list_ids_update;
            state_action.state = $scope.carp_name;
            var params = JSON.stringify(state_action);
            console.log(params)
            Email.deleteEmail(params, function(respon) {
                vm.seleccionados = []
                Email.list_emails($('#data-user-email').attr('email'), function(emails) {
                    vm.emails = emails;
                });
            });
        } else {
            $scope.error = "No hay seleccionados, seleccione para eliminar";
            $scope.error_show = true
        }
    }
    vm.reenviar = function(email) {
        if (typeof email != 'undefined')
            email_temp = email;
        $location.url("email/redact/reen");
    }
}

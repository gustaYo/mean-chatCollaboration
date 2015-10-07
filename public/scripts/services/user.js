
'use strict';
/**
 * @ngdoc service
 * @name myapp.users
 * @description
 * # Todo
 * Factory in the emailANGULAR.  GUstavo Crespo Sanchez gcrespo@uci.cu
 */
angular.module(AppName)
        .factory('User', function($resource, $stateParams) {
    var emails = $resource('auth/getusers/:entryId', {}, {
        query: {method: 'GET', params: {entryId: '@entryId'}, isArray: true},
    });
    var result = {
        listUsers: function(idUser, callback) {
            emails.query({entryId: idUser}).$promise.then(function(respuesta) {
                callback(respuesta)
            });
        },
    };
    return result;



});

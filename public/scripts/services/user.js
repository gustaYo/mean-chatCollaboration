
'use strict';
/**
 * @ngdoc service
 * @name myapp.users
 * @description
 * # Todo
 * Factory in the emailANGULAR.  GUstavo Crespo Sanchez gcrespo@uci.cu
 */
angular.module('myapp')
        .factory('User', function($resource, $stateParams) {
            var emails = $resource('auth/getusers/:entryId', {}, {
                query: {method: 'GET', params: {entryId: ''}, isArray: true},
            });
            var result = {
                listUsers: function(callback) {
                    emails.query().$promise.then(function(respuesta) {
                        callback(respuesta)
                    });
                }
            };
            return result;

        });

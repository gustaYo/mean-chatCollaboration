
'use strict';
/**
 * @ngdoc service
 * @name myapp.emails
 * @description
 * # Todo
 * Factory in the emailANGULAR.  GUstavo Crespo Sanchez gcrespo@uci.cu
 */
angular.module('myapp')
        .factory('Email', function($resource, $stateParams) {
            var emails = $resource('email/api/:entryId', {}, {
                query: {method: 'GET', params: {entryId: '@entryId'}, isArray: true},
                post: {method: 'POST'},
                update: {method: 'PUT', params: {entryId: '@entryId'}},
                remove: {method: 'DELETE', params: {entryId: '@entryId'}}
            });
            var result = {
                insertEmail: function(send_email, next) {
                    emails.post(send_email).$promise.then(function(respuesta) {
                        next(respuesta)
                    });
                },
                updateEmail: function(email, next) {
                    emails.update(email).$promise.then(function(respuesta) {
                        next(respuesta)
                    });
                    return false;
                },
                deleteEmail: function(id_email, next) {
                    emails.remove({entryId: id_email}).$promise.then(function(respuesta) {
                        next(respuesta)
                    });
                },
                list_emails: function(email, callback) {
                    emails.query({entryId: $stateParams.data}).$promise.then(function(respuesta) {
                        callback(respuesta)
                    });
                }
            };
            return result;

        });

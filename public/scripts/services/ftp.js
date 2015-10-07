'use strict';
/**
 * @ngdoc service
 * @name myapp.ftp
 * @description
 * # Todo
 * Factory in the colaborationWeb.  GUstavo Crespo Sanchez gcrespo@uci.cu
 */
angular.module('Module.ftp')
        .factory('Ftp', function($resource, $stateParams, $http) {
    var model = $resource('ftp/api/:entryId', {}, {
        query: {method: 'GET', params: {entryId: '@entryId'}, isArray: true},
        post: {method: 'POST'},
        update: {method: 'PUT', params: {entryId: '@entryId'}},
        remove: {method: 'DELETE', params: {entryId: '@entryId'}}
    });
    var result = {
        insertFtp: function(ftp, next) {
            model.post(ftp).$promise.then(function(respuesta) {
                next(respuesta)
            });
        },
        update: function(email, next) {
            model.update(email).$promise.then(function(respuesta) {
                next(respuesta)
            });
            return false;
        },
        deleteFtp: function(id, next) {
            model.remove({entryId: id}).$promise.then(function(respuesta) {
                next(respuesta)
            });
        },
        getAll: function(data, callback) {
            model.query({entryId: JSON.stringify(data)}).$promise.then(function(respuesta) {
                callback(respuesta)
            });
//            $http.get('ftp/api/all').success(function(respuesta) {
//                callback(respuesta)
//            }).
//                    error(function() {
//                alert('Error');
//            });
        }
    };
    return result;

});


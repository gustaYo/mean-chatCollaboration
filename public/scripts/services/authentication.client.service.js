'use strict';

// Authentication service for user variables
angular.module('myapp')
        .factory('Authentication', function($resource, $stateParams,$http) {
         var _this = this;

        _this._data = {
            user: window.user
        };
        return _this._data;
        })

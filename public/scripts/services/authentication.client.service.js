'use strict';

// Authentication service for user variables
angular.module(AppName)
        .factory('Authentication', function($resource, $stateParams, $http, $location, $q) {
            var user = window.user;
            // public API
            return {
                getUser: function() {
                    return user;
                },
                updateUser: function(value) {
                    user = value;
                    return value;
                },
                isLoggedIn: function() {
                    return (user) ? true : false;
                }
            };
        })

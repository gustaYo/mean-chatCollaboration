'use strict';
//http://stackoverflow.com/questions/20969835/angularjs-login-and-authentication-in-each-route-and-controller
// Authentication service for user variables
angular.module(AppName)
        .factory("Access", ["$q", "UserProfile",
            function($q, UserProfile) {

                "use strict";

                var Access = {
                    OK: 200,
                    UNAUTHORIZED: 401,
                    FORBIDDEN: 403,
                    hasRole: function(role) {
                        var deferred = $q.defer();
                        UserProfile.then(function(userProfile) {
                            if (userProfile.$hasRole(role)) {
                                deferred.resolve(Access.OK);
                            } else if (userProfile.$isAnonymous()) {
                                deferred.reject(Access.UNAUTHORIZED);
                            } else {
                                deferred.reject(Access.FORBIDDEN);
                            }
                        });
                        return deferred.promise;
                    },
                    hasAnyRole: function(roles) {
                        var deferred = $q.defer();
                        UserProfile.then(function(userProfile) {
                            if (userProfile.$hasAnyRole(roles)) {
                                deferred.resolve(Access.OK);
                            } else if (userProfile.$isAnonymous()) {
                                deferred.reject(Access.UNAUTHORIZED);
                            } else {
                                deferred.reject(Access.FORBIDDEN);
                            }
                        });
                        return deferred.promise;
                    },
                    isAnonymous: function() {
                        var deferred = $q.defer();
                        UserProfile.then(function(userProfile) {
                            if (userProfile.$isAnonymous()) {
                                deferred.resolve(Access.OK);
                            } else {
                                deferred.reject(Access.FORBIDDEN);
                            }
                        });
                        return deferred.promise;
                    },
                    isAuthenticated: function() {
                        var deferred = $q.defer();
                        UserProfile.then(function(userProfile) {
                            if (userProfile.$isAuthenticated()) {
                                deferred.resolve(Access.OK);
                            } else {
                                deferred.reject(Access.UNAUTHORIZED);
                            }
                        });
                        return deferred.promise;
                    }

                };
                return Access;
            }]);
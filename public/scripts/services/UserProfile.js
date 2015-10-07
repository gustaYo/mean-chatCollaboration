module.factory("UserProfile", ["$q", "User",
    function($q, User) {

        "use strict";

        var userProfile = {};

        var fetchUserProfile = function() {
            var deferred = $q.defer();
            User.profile(function(response) {

                for (var prop in userProfile) {
                    if (userProfile.hasOwnProperty(prop)) {
                        delete userProfile[prop];
                    }
                }

                deferred.resolve(angular.extend(userProfile, response, {
                    $refresh: fetchUserProfile,
                    $hasRole: function(role) {
                        return userProfile.roles.indexOf(role) >= 0;
                    },
                    $hasAnyRole: function(roles) {
                        return !!userProfile.roles.filter(function(role) {
                            return roles.indexOf(role) >= 0;
                        }).length;
                    },
                    $isAnonymous: function() {
                        return userProfile.anonymous;
                    },
                    $isAuthenticated: function() {
                        return !userProfile.anonymous;
                    }

                }));

            });
            return deferred.promise;
        };

        return fetchUserProfile();

    }]);